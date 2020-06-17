// @flow
// Handles Connect to Ledger Hardware Wallet dialog

import { observable, action } from 'mobx';

import type { ExtendedPublicKeyResp } from '@emurgo/ledger-connect-handler';
import LedgerConnect, {
  makeCardanoAccountBIP44Path,
} from '@emurgo/ledger-connect-handler';

import Config from '../../config';

import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';

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

import {
  prepareLedgerConnect,
} from '../../utils/hwConnectHandler';

import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import { CheckAddressesInUseApiError } from '../../api/ada/errors';

import {
  Logger,
  stringifyData,
  stringifyError
} from '../../utils/logging';
import { HARD_DERIVATION_START } from '../../config/numbersConfig';

export default class LedgerConnectStore
  extends Store
  implements HWConnectStoreTypes<ExtendedPublicKeyResp> {

  // =================== VIEW RELATED =================== //
  @observable progressInfo: ProgressInfo;
  @observable derivationIndex: number = HARD_DERIVATION_START + 0; // assume single account
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
  }

  /** setup() is called when stores are being created
    * _init() is called when connect dialog is about to show */
  _init: void => void = () => {
    Logger.debug('LedgerConnectStore::_init called');
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
    this.progressInfo = {
      currentStep: ProgressStep.CHECK,
      stepState: StepState.LOAD,
    };

    this.error = undefined;
    this.hwDeviceInfo = undefined;
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

  _checkAndStoreHWDeviceInfo: void => Promise<void> = async () => {
    try {
      this.ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale
      });
      await prepareLedgerConnect(this.ledgerConnect);

      const accountPath = makeCardanoAccountBIP44Path(this.derivationIndex - HARD_DERIVATION_START);
      // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#examples
      Logger.debug(stringifyData(accountPath));

      // get Cardano's first account's
      // i.e hdPath = [2147483692, 2147485463, 2147483648]
      let extendedPublicKeyResp: ExtendedPublicKeyResp;
      if (this.ledgerConnect) {
        extendedPublicKeyResp = await this.ledgerConnect.getExtendedPublicKey(accountPath);

        this.hwDeviceInfo = this._normalizeHWResponse({
          ePublicKey: extendedPublicKeyResp.ePublicKey,
          deviceVersion: extendedPublicKeyResp.deviceVersion
        });
      }

      this._goToSaveLoad();
      Logger.info('Ledger device OK');
    } catch (error) {
      this._handleConnectError(error);
    } finally {
      this.ledgerConnect && this.ledgerConnect.dispose();
      this.ledgerConnect = undefined;
    }
  };

  _normalizeHWResponse: ExtendedPublicKeyResp => HWDeviceInfo = (
    resp,
  ) => {
    this._validateHWResponse(resp);

    const { ePublicKey, } = resp;

    return {
      publicMasterKey: ePublicKey.publicKeyHex + ePublicKey.chainCodeHex,
      hwFeatures: {
        Vendor: Config.wallets.hardwareWallet.ledgerNano.VENDOR,
        Model: '', // Ledger does not provide device model info up till now
        DeviceId: '',
      },
      defaultName: '',
    };
  }

  _validateHWResponse: ExtendedPublicKeyResp => boolean = (
    resp,
  ) => {
    const { ePublicKey, deviceVersion } = resp;

    if (deviceVersion == null) {
      throw new Error('Ledger device version response is undefined');
    }

    if (ePublicKey == null) {
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
        this.derivationIndex,
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

  _prepareCreateHWReqParams: (string, number) => CreateHardwareWalletRequest = (
    walletName,
    derivationIndex,
  ) => {
    if (this.hwDeviceInfo == null
      || this.hwDeviceInfo.publicMasterKey == null
      || this.hwDeviceInfo.hwFeatures == null) {
      throw new Error('Ledger device hardware info not valid');
    }

    const persistentDb = this.stores.loading.loadPersitentDbRequest.result;
    if (persistentDb == null) {
      throw new Error(`${nameof(this._prepareCreateHWReqParams)} db not loaded. Should never happen`);
    }

    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
    return {
      db: persistentDb,
      derivationIndex,
      walletName,
      publicKey: this.hwDeviceInfo.publicMasterKey,
      hwFeatures: this.hwDeviceInfo.hwFeatures,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
    };
  };

  async _onSaveSuccess(publicDeriver: PublicDeriver<>): Promise<void> {
    // close the active dialog
    Logger.debug('LedgerConnectStore::_onSaveSuccess success, closing dialog');
    this.actions.dialogs.closeActiveDialog.trigger();

    const { wallets } = this.stores;
    await wallets.addHwWallet(publicDeriver);

    // show success notification
    wallets.showLedgerWalletIntegratedNotification();

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

  // =================== API =================== //
}
