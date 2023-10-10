// @flow
// Handles Connect to Ledger Hardware Wallet dialog

import { observable, action, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import type { ExtendedPublicKeyResp } from '../../utils/hwConnectHandler';

import Config from '../../config';

import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import { ROUTES } from '../../routes-config';

import type {
  CreateHardwareWalletRequest,
  CreateHardwareWalletFunc,
} from '../../api/ada';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';

import {
  convertToLocalizableError
} from '../../domain/LedgerLocalizedError';

// This is actually just an interface
import {
  HWConnectStoreTypes,
  ProgressStep,
  ProgressInfo,
  HWDeviceInfo
} from '../../types/HWConnectStoreTypes';
import { StepState } from '../../components/widgets/ProgressSteps';

import { LedgerConnect } from '../../utils/hwConnectHandler';

import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import { CheckAddressesInUseApiError } from '../../api/common/errors';

import {
  Logger,
  stringifyData,
  stringifyError
} from '../../utils/logging';
import {
  CoinTypes,
  HARD_DERIVATION_START,
  WalletTypePurpose,
} from '../../config/numbersConfig';
import {
  Bip44DerivationLevels,
} from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import type {
  RestoreModeType,
} from '../../actions/common/wallet-restore-actions';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import {
  genTimeToSlot,
} from '../../api/ada/lib/storage/bridge/timeUtils';
import { getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type {
  GetExtendedPublicKeyResponse,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

export default class LedgerConnectStore
  extends Store<StoresMap, ActionsMap>
  implements HWConnectStoreTypes<ExtendedPublicKeyResp<GetExtendedPublicKeyResponse>> {

  // =================== VIEW RELATED =================== //
  @observable progressInfo: ProgressInfo;
  @observable derivationIndex: number = HARD_DERIVATION_START + 0; // assume single account
  @observable mode: void | RestoreModeType;
  error: ?LocalizableError;
  hwDeviceInfo: ?HWDeviceInfo;
  ledgerConnect: ?LedgerConnect;

  get defaultWalletName(): string {
    // Ledger doesn’t provide any device name so using hard-coded name
    return Config.wallets.hardwareWallet.ledgerNano.DEFAULT_WALLET_NAME;
  }

  get isActionProcessing(): boolean {
    return this.progressInfo.stepState === StepState.PROCESS;
  }
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createHWRequest: LocalizedRequest<CreateHardwareWalletFunc>
    = new LocalizedRequest<CreateHardwareWalletFunc>(this.api.ada.createHardwareWallet);

  /** While ledger wallet creation is taking place, we need to block users from starting a
    * ledger wallet creation on a separate wallet and explain to them why the action is blocked */
  @observable isCreateHWActive: boolean = false;
  // =================== API RELATED =================== //

  setup(): void {
    super.setup();
    this._reset();
    const ledgerConnectAction = this.actions.ada.ledgerConnect;
    ledgerConnectAction.init.listen(this._init);
    ledgerConnectAction.cancel.listen(this._cancel);
    ledgerConnectAction.submitCheck.listen(this._submitCheck);
    ledgerConnectAction.goBackToCheck.listen(this._goBackToCheck);
    ledgerConnectAction.submitConnect.listen(this._submitConnect);
    ledgerConnectAction.submitSave.listen(this._submitSave);
    ledgerConnectAction.finishTransfer.listen(this._finishTransfer);
    ledgerConnectAction.setMode.listen((mode) => runInAction(() => { this.mode = mode; }));
  }

  /** setup() is called when stores are being created
    * _init() is called when connect dialog is about to show */
  _init: void => void = () => {
    Logger.debug(`${nameof(LedgerConnectStore)}::${nameof(this._init)} called`);
  }

  @action _cancel: void => void = () => {
    this.teardown();
    this.ledgerConnect && this.ledgerConnect.dispose();
    this.ledgerConnect = undefined;
  };

  teardown(): void {
    this._reset();
    super.teardown();
  }

  @action _reset: void => void = () => {
    this.mode = undefined;
    this.progressInfo = {
      currentStep: ProgressStep.CHECK,
      stepState: StepState.LOAD,
    };

    this.error = undefined;
    this.hwDeviceInfo = undefined;
    this.stores.substores.ada.yoroiTransfer.transferRequest.reset();
    this.stores.wallets.sendMoneyRequest.reset();
  };

  @action _openTransferDialog: void => void = () => {
    this.error = undefined;
    this.progressInfo.currentStep = ProgressStep.TRANSFER;
    this.progressInfo.stepState = StepState.PROCESS;
  };

  // =================== CHECK =================== //
  /** CHECK dialog submit(Next button) */
  @action _submitCheck: void => void = () => {
    this.error = undefined;
    this.progressInfo.currentStep = ProgressStep.CONNECT;
    this.progressInfo.stepState = StepState.LOAD;
  };
  // =================== CHECK =================== //

  // =================== CONNECT =================== //
  /** CONNECT dialog goBack button */
  @action _goBackToCheck: void => void = () => {
    this.error = undefined;
    this.progressInfo.currentStep = ProgressStep.CHECK;
    this.progressInfo.stepState = StepState.LOAD;
  };

  /** CONNECT dialog submit (Connect button) */
  @action _submitConnect: void => Promise<void> = async () => {
    this.error = undefined;
    this.progressInfo.currentStep = ProgressStep.CONNECT;
    this.progressInfo.stepState = StepState.PROCESS;
    await this._checkAndStoreHWDeviceInfo();
  };

  _getPublicKey: {|
    path: Array<number>
  |} => Promise<HWDeviceInfo> = async (request) => {
    Logger.debug(stringifyData(request));
    try {
      const ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale,
      });
      this.ledgerConnect = ledgerConnect;

      const extendedPublicKeyResp = await ledgerConnect.getExtendedPublicKey({
        params: {
          path: request.path,
        },
        // don't pass serial
        // since we use the request to fetch the public key to get the serial # in the first place
        serial: undefined,
      });

      return this._normalizeHWResponse(extendedPublicKeyResp);
    } finally {
      this.ledgerConnect && this.ledgerConnect.dispose();
      this.ledgerConnect = undefined;
    }
  }

  _getMultiplePublicKeys: {|
    paths: Array<Array<number>>
  |} => Promise<Array<HWDeviceInfo>> = async (request) => {
    Logger.debug(stringifyData(request));
    try {
      const ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale,
      });
      this.ledgerConnect = ledgerConnect;

      const extendedPublicKeysResp = await ledgerConnect.getExtendedPublicKeys({
        params: {
          paths: request.paths,
        },
        // don't pass serial
        // since we use the request to fetch the public key to get the serial # in the first place
        serial: undefined,
      });

      return extendedPublicKeysResp.response.map(response => (
        {
          response,
          deviceVersion: extendedPublicKeysResp.deviceVersion,
          deriveSerial: extendedPublicKeysResp.deriveSerial,
        }
      )).map(this._normalizeHWResponse);
    } finally {
      this.ledgerConnect && this.ledgerConnect.dispose();
      this.ledgerConnect = undefined;
    }
  }

  _generateTransferTx: (string, string) => Promise<void> = async (
    bip44Key,
    cip1852Key,
  ) => {
    const bip44AccountPubKey = RustModule.WalletV4.Bip32PublicKey.from_bytes(
      Buffer.from(bip44Key, 'hex')
    );
    const cip1852AccountPubKey = RustModule.WalletV4.Bip32PublicKey.from_bytes(
      Buffer.from(cip1852Key, 'hex')
    );
    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
    if (this.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(LedgerConnectStore)}::${nameof(this._checkAndStoreHWDeviceInfo)} no network selected`);
    }
    const { selectedNetwork } = this.stores.profile;
    const fullConfig = getCardanoHaskellBaseConfig(
      selectedNetwork
    );
    const timeToSlot = await genTimeToSlot(fullConfig);

    try {
      await this.stores.substores.ada.yoroiTransfer.transferRequest.execute({
        cip1852AccountPubKey,
        bip44AccountPubKey,
        accountIndex: this.derivationIndex,
        checkAddressesInUse: stateFetcher.checkAddressesInUse,
        getUTXOsForAddresses: stateFetcher.getUTXOsForAddresses,
        absSlotNumber: new BigNumber(timeToSlot({
          // use server time for TTL if connected to server
          time: this.stores.serverConnectionStore.serverTime ?? new Date(),
        }).slot),
        network: selectedNetwork,
        defaultToken: this.stores.tokenInfoStore.getDefaultTokenInfo(selectedNetwork.NetworkId),
      }).promise;
    } catch (_e) {
      // usually this means no internet connection or not enough ADA to upgrade
      // so we just ignore this case
    }
  }

  _checkAndStoreHWDeviceInfo: void => Promise<void> = async () => {
    this.stores.substores.ada.yoroiTransfer.transferRequest.reset();
    const accountPath = this.getPath();
    try {
      // if restoring a Shelley wallet, check if there is any Byron balance
      if (accountPath[0] === WalletTypePurpose.CIP1852) {
        const bip44Path = [...accountPath];
        bip44Path[0] = WalletTypePurpose.BIP44;

        const [ pubKeyResponse, bip44Response ] = await this._getMultiplePublicKeys(
          {
            paths: [accountPath, bip44Path],
          }
        );

        this.hwDeviceInfo = pubKeyResponse;

        await this._generateTransferTx(
          bip44Response.publicMasterKey,
          pubKeyResponse.publicMasterKey, // cip1852
        );
      } else {
        const pubKeyResponse = await this._getPublicKey({ path: accountPath });
        this.hwDeviceInfo = pubKeyResponse;
      }
      this._goToSaveLoad();
      Logger.info('Ledger device OK');
    } catch (error) {
      this._handleConnectError(error);
    }
  };

  _normalizeHWResponse: ExtendedPublicKeyResp<GetExtendedPublicKeyResponse> => HWDeviceInfo = (
    resp,
  ) => {
    this._validateHWResponse(resp);

    const { response, } = resp;

    return {
      publicMasterKey: response.publicKeyHex + response.chainCodeHex,
      hwFeatures: {
        Vendor: Config.wallets.hardwareWallet.ledgerNano.VENDOR,
        Model: '', // Ledger does not provide device model info up till now
        DeviceId: resp.deriveSerial.serialHex,
      },
      defaultName: '',
    };
  }

  _validateHWResponse: ExtendedPublicKeyResp<GetExtendedPublicKeyResponse> => boolean = (
    resp,
  ) => {
    if (resp.deviceVersion == null) {
      throw new Error('Ledger device version response is undefined');
    }
    if (resp.response == null) {
      throw new Error('Ledger device extended public key response is undefined');
    }

    return true;
  };

  _handleConnectError: Error => void = (error) => {
    this.hwDeviceInfo = undefined;
    this.error = convertToLocalizableError(error);

    this._goToConnectError();
  };

  @action _goToConnectError: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.CONNECT;
    this.progressInfo.stepState = StepState.ERROR;
  };
  // =================== CONNECT =================== //

  // =================== SAVE =================== //
  @action _goToSaveLoad: void => void = () => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.LOAD;
  };

  @action _goToTransfer: void => void = () => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.LOAD;
  };

  /** SAVE dialog submit (Save button) */
  @action _submitSave: (string) => Promise<void> = async (
    walletName,
  ) => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.PROCESS;
    await this._saveHW(
      walletName,
    );
  };

  /** creates new wallet and loads it */
  _saveHW: (string) => Promise<void> = async (
    walletName,
  )  => {
    try {
      Logger.debug(`${nameof(LedgerConnectStore)}::${nameof(this._saveHW)}:: called`);
      this._setIsCreateHWActive(true);
      this.createHWRequest.reset();

      const reqParams = this._prepareCreateHWReqParams(
        walletName,
      );
      this.createHWRequest.execute(reqParams);
      if (!this.createHWRequest.promise) throw new Error('should never happen');
      const newWallet = await this.createHWRequest.promise;

      await this._onSaveSuccess(newWallet.publicDeriver);
    } catch (error) {
      Logger.error(`${nameof(LedgerConnectStore)}::${nameof(this._saveHW)}::error ${stringifyError(error)}`);

      // Refer: https://github.com/Emurgo/yoroi-frontend/pull/1055
      if (error instanceof CheckAddressesInUseApiError) {
        /**
         * This error happens when yoroi could not fetch Used Address.
         * Mostly because internet not connected or yoroi backend is down.
         * At this point wallet is already created in the storage.
         * When internet connection is back, everything will be loaded correctly.
         */
        return;
      }

      if (error instanceof LocalizableError) {
        this.error = error;
      } else {
        // some unknown error
        this.error = new UnexpectedError();
      }
      this._goToSaveError();
    } finally {
      this.createHWRequest.reset();
      this._setIsCreateHWActive(false);
    }
  };

  _prepareCreateHWReqParams: string => CreateHardwareWalletRequest = (
    walletName,
  ) => {
    if (this.hwDeviceInfo == null
      || this.hwDeviceInfo.publicMasterKey == null
      || this.hwDeviceInfo.hwFeatures == null) {
      throw new Error('Ledger device hardware info not valid');
    }
    const { publicMasterKey, hwFeatures } = this.hwDeviceInfo;

    const persistentDb = this.stores.loading.getDatabase();
    if (persistentDb == null) {
      throw new Error(`${nameof(this._prepareCreateHWReqParams)} db not loaded. Should never happen`);
    }
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this._prepareCreateHWReqParams)} no network selected`);

    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;

    return {
      db: persistentDb,
      addressing: {
        path: this.getPath(),
        startLevel: Bip44DerivationLevels.PURPOSE.level,
      },
      walletName,
      publicKey: publicMasterKey,
      hwFeatures,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      network: selectedNetwork,
    };
  };

  getPath: void => Array<number> = () => {
    const suffix = [CoinTypes.CARDANO, this.derivationIndex];
    if (this.mode == null) {
      throw new Error(`${nameof(LedgerConnectStore)}::${nameof(this._prepareCreateHWReqParams)} missing mode`);
    }
    if (this.mode.type === 'bip44') {
      return [WalletTypePurpose.BIP44, ...suffix];
    }
    if (this.mode.type === 'cip1852') {
      return [WalletTypePurpose.CIP1852, ...suffix];
    }
    throw new Error(`${nameof(LedgerConnectStore)}::${nameof(this._prepareCreateHWReqParams)} unknown purpose`);
  }

  async _onSaveSuccess(publicDeriver: PublicDeriver<>): Promise<void> {
    // close the active dialog
    Logger.debug(`${nameof(LedgerConnectStore)}::${nameof(this._onSaveSuccess)} success`);
    if (this.stores.substores.ada.yoroiTransfer.transferRequest.result == null) {
      this.actions.dialogs.closeActiveDialog.trigger();
    }

    await this.stores.wallets.addHwWallet(publicDeriver);
    this.actions.wallets.setActiveWallet.trigger({
      wallet: publicDeriver
    });
    if (this.stores.substores.ada.yoroiTransfer.transferRequest.result == null) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });

      // show success notification
      this.stores.wallets.showLedgerWalletIntegratedNotification();

      this.teardown();
      Logger.info('SUCCESS: Ledger Connected Wallet created and loaded');
    } else {
      this._openTransferDialog();
    }
  }

  _finishTransfer: void => void = () => {
    this.actions.dialogs.closeActiveDialog.trigger();
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });

    // show success notification
    this.stores.wallets.showLedgerWalletIntegratedNotification();

    this.teardown();
    Logger.info('SUCCESS: Ledger Connected Wallet created and loaded');
  }

  @action _goToSaveError: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.ERROR;
  };
  // =================== SAVE =================== //

  // =================== API =================== //
  @action _setIsCreateHWActive: boolean => void = (active) => {
    this.isCreateHWActive = active;
  };

  // this is used to inject test data
  setSelectedMockWallet: string => Promise<void> = async (serial) => {
    // $FlowExpectedError[prop-missing] only added in tests
    if (LedgerConnect.setSelectedWallet != null) {
      // $FlowExpectedError[not-a-function] only added in tests
      await LedgerConnect.setSelectedWallet(serial);
    }
  }

  // =================== API =================== //
}
