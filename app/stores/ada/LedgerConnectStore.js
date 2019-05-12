// @flow
// Handles Connect to Ledger Hardware Wallet dialog

import { observable, action } from 'mobx';

import {
  LedgerBridge,
  makeCardanoAccountBIP44Path,
} from 'yoroi-extension-ledger-bridge';
import type {
  GetVersionResponse,
  GetExtendedPublicKeyResponse,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import Config from '../../config';
import environment from '../../environment';

import Store from '../base/Store';
import Wallet from '../../domain/Wallet';
import LocalizedRequest from '../lib/LocalizedRequest';

import type {
  CreateHardwareWalletRequest,
  CreateHardwareWalletFunc,
} from '../../api/ada';

import {
  convertToLocalizableError
} from '../../domain/LedgerLocalizedError';

// This is actually just an interface
import {
  HWConnectStoreTypes,
  StepState,
  ProgressStep,
  ProgressInfo,
  HWDeviceInfo
} from '../../types/HWConnectStoreTypes';

import {
  prepareLedgerBridger,
  disposeLedgerBridgeIFrame
} from '../../utils/iframeHandler';

import globalMessages from '../../i18n/global-messages';
import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import { CheckAdressesInUseApiError } from '../../api/ada/errors';

import {
  Logger,
  stringifyData,
  stringifyError
} from '../../utils/logging';

/** TODO: TrezorConnectStore and LedgerConnectStore has many common methods
  * try to make a common base class */
export default class LedgerConnectStore extends Store implements HWConnectStoreTypes {

  // =================== VIEW RELATED =================== //
  @observable progressInfo: ProgressInfo;
  error: ?LocalizableError;
  hwDeviceInfo: ?HWDeviceInfo;
  ledgerBridge: ?LedgerBridge;

  get defaultWalletName(): string {
    // Ledger doesn’t provide any device name so using hard-coded name
    return Config.wallets.hardwareWallet.ledgerNanoS.DEFAULT_WALLET_NAME;
  }

  get isActionProcessing(): boolean {
    return this.progressInfo.stepState === StepState.PROCESS;
  }
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createHWRequest: LocalizedRequest<CreateHardwareWalletFunc>
    = new LocalizedRequest<CreateHardwareWalletFunc>(this.api.ada.createHardwareWallet);

  /** While ledger wallet creation is taking place, we need to block users from starting a
    * ledger wallet creation on a seperate wallet and explain to them why the action is blocked */
  @observable isCreateHWActive: boolean = false;
  // =================== API RELATED =================== //

  setup() {
    this._reset();
    const ledgerConnectAction = this.actions.ada.ledgerConnect;
    ledgerConnectAction.init.listen(this._init);
    ledgerConnectAction.cancel.listen(this._cancel);
    ledgerConnectAction.submitAbout.listen(this._submitAbout);
    ledgerConnectAction.goBackToAbout.listen(this._goBackToAbout);
    ledgerConnectAction.submitConnect.listen(this._submitConnect);
    ledgerConnectAction.submitSave.listen(this._submitSave);
  }

  /** setup() is called when stores are being created
    * _init() is called when connect dailog is about to show */
  _init = (): void => {
    Logger.debug('LedgerConnectStore::_init called');
    if (this.ledgerBridge == null) {
      Logger.debug('LedgerConnectStore::_init new LedgerBridge created');
      this.ledgerBridge = new LedgerBridge();
    }
  }

  @action _cancel = (): void => {
    this.teardown();
  };

  teardown(): void {
    this._reset();
    super.teardown();
  }

  @action _reset = (): void => {
    disposeLedgerBridgeIFrame();
    this.ledgerBridge = undefined;

    this.progressInfo = {
      currentStep: ProgressStep.ABOUT,
      stepState: StepState.LOAD,
    };

    this.error = undefined;
    this.hwDeviceInfo = undefined;
  };

  // =================== ABOUT =================== //
  /** ABOUT dialog submit(Next button) */
  @action _submitAbout = (): void => {
    this.error = undefined;
    this.progressInfo.currentStep = ProgressStep.CONNECT;
    this.progressInfo.stepState = StepState.LOAD;
  };
  // =================== ABOUT =================== //

  // =================== CONNECT =================== //
  /** CONNECT dialog goBack button */
  @action _goBackToAbout = (): void => {
    this.error = undefined;
    this.progressInfo.currentStep = ProgressStep.ABOUT;
    this.progressInfo.stepState = StepState.LOAD;
  };

  /** CONNECT dialog submit (Connect button) */
  @action _submitConnect = (): void => {
    this.error = undefined;
    this.progressInfo.currentStep = ProgressStep.CONNECT;
    this.progressInfo.stepState = StepState.PROCESS;
    this._checkAndStoreHWDeviceInfo();
  };

  _checkAndStoreHWDeviceInfo = async (): Promise<void> => {
    try {
      if (this.ledgerBridge) {
        // Since this.ledgerBridge is undefinable flow need to know that it's a LedgerBridge
        const ledgerBridge: LedgerBridge = this.ledgerBridge;
        await prepareLedgerBridger(ledgerBridge);

        const versionResp: GetVersionResponse = await ledgerBridge.getVersion();

        Logger.debug(stringifyData(versionResp));

        // TODO: assume single account in Yoroi
        const accountPath = makeCardanoAccountBIP44Path(0);
        // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#examples
        Logger.debug(stringifyData(accountPath));

        // get Cardano's first account's
        // i.e hdPath = [2147483692, 2147485463, 2147483648]
        const extendedPublicKeyResp: GetExtendedPublicKeyResponse
          = await ledgerBridge.getExtendedPublicKey(accountPath);

        this.hwDeviceInfo = this._normalizeHWResponse(versionResp, extendedPublicKeyResp);

        this._goToSaveLoad();
        Logger.info('Ledger device OK');
      } else {
        throw new Error(`LedgerBridge Error: LedgerBridge is undefined`);
      }
    } catch (error) {
      this._handleConnectError(error);
    }
  };

  _normalizeHWResponse = (
    versionResp: GetVersionResponse,
    extendedPublicKeyResp: GetExtendedPublicKeyResponse
  ): HWDeviceInfo => {
    this._validateHWResponse(versionResp, extendedPublicKeyResp);

    return {
      publicMasterKey: extendedPublicKeyResp.publicKeyHex + extendedPublicKeyResp.chainCodeHex,
      hwFeatures: {
        vendor: Config.wallets.hardwareWallet.ledgerNanoS.VENDOR,
        model: Config.wallets.hardwareWallet.ledgerNanoS.MODEL,
        label: '',
        deviceId: '',
        language: '',
        majorVersion: parseInt(versionResp.major, 10),
        minorVersion: parseInt(versionResp.minor, 10),
        patchVersion: parseInt(versionResp.patch, 10),
      }
    };
  }

  _validateHWResponse = (
    versionResp: GetVersionResponse,
    extendedPublicKeyResp: GetExtendedPublicKeyResponse
  ): boolean => {
    if (versionResp == null) {
      throw new Error('Ledger device version response is undefined');
    }

    if (extendedPublicKeyResp == null) {
      throw new Error('Ledger device extended public key response is undefined');
    }

    return true;
  };

  _handleConnectError = (error: any): void => {
    Logger.error(`LedgerConnectStore::_checkAndStoreHWDeviceInfo ${stringifyError(error)}`);

    this.hwDeviceInfo = undefined;
    this.error = convertToLocalizableError(error);

    this._goToConnectError();
  };

  @action _goToConnectError = (): void => {
    this.progressInfo.currentStep = ProgressStep.CONNECT;
    this.progressInfo.stepState = StepState.ERROR;
  };
  // =================== CONNECT =================== //

  // =================== SAVE =================== //
  @action _goToSaveLoad = (): void => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.LOAD;
  };

  /** SAVE dialog submit (Save button) */
  @action _submitSave = (walletName: string): void => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.PROCESS;
    this._saveHW(walletName);
  };

  /** creates new wallet and loads it */
  _saveHW = async (walletName: string): Promise<void>  => {
    try {
      Logger.debug('LedgerConnectStore::_saveHW:: called');
      this._setIsCreateHWActive(true);
      this.createHWRequest.reset();

      const reqParams = this._prepareCreateHWReqParams(walletName);
      this.createHWRequest.execute(reqParams);
      if (!this.createHWRequest.promise) throw new Error('should never happen');
      const ledgerWallet = await this.createHWRequest.promise;

      await this._onSaveSucess(ledgerWallet);
    } catch (error) {
      Logger.error(`LedgerConnectStore::_saveHW::error ${stringifyError(error)}`);

      if (error instanceof CheckAdressesInUseApiError) {
        // redirecting CheckAdressesInUseApiError -> hwConnectDialogSaveError101
        // because for user hwConnectDialogSaveError101 is more meaningful in this context
        this.error = new LocalizableError(globalMessages.hwConnectDialogSaveError101);
      } else if (error instanceof LocalizableError) {
        this.error = error;
      } else {
        // some unknow error
        this.error = new UnexpectedError();
      }
      this._goToSaveError();
    } finally {
      this.createHWRequest.reset();
      this._setIsCreateHWActive(false);
    }
  };

  _prepareCreateHWReqParams = (walletName: string): CreateHardwareWalletRequest => {
    if (this.hwDeviceInfo == null
      || this.hwDeviceInfo.publicMasterKey == null
      || this.hwDeviceInfo.hwFeatures == null) {
      throw new Error('Ledger device hardware info not valid');
    }

    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    return {
      walletName,
      publicMasterKey: this.hwDeviceInfo.publicMasterKey,
      hwFeatures: this.hwDeviceInfo.hwFeatures,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
    };
  };

  async _onSaveSucess(ledgerWallet: Wallet): Promise<void> {
    // close the active dialog
    Logger.debug('LedgerConnectStore::_onSaveSucess success, closing dialog');
    this.actions.dialogs.closeActiveDialog.trigger();

    const { wallets } = this.stores.substores[environment.API];
    await wallets._patchWalletRequestWithNewWallet(ledgerWallet);

    // goto the wallet transactions page
    Logger.debug('LedgerConnectStore::_onSaveSucess setting new walles as active wallet');
    wallets.goToWalletRoute(ledgerWallet.id);

    // fetch its data
    Logger.debug('LedgerConnectStore::_onSaveSucess loading wallet data');
    wallets.refreshWalletsData();

    // Load the Yoroi with Ledger Icon
    this.stores.topbar.initCategories();

    // show success notification
    wallets.showLedgerNanoSWalletIntegratedNotification();

    this.teardown();
    Logger.info('SUCCESS: Ledger Connected Wallet created and loaded');
  }

  @action _goToSaveError = (): void => {
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.ERROR;
  };
  // =================== SAVE =================== //

  // =================== API =================== //
  @action _setIsCreateHWActive = (active: boolean): void => {
    this.isCreateHWActive = active;
  };

  // =================== API =================== //
}
