// @flow
// Handles Connect to Ledger Hardware Wallet dialog

import { observable, action } from 'mobx';
import { defineMessages } from 'react-intl';

import {
  LedgerBridge,
  YOROI_LEDGER_BRIDGE_IFRAME_NAME,
  BIP44_HARDENED_CARDANO_FIRST_ACCOUNT_SUB_PATH as CARDANO_FIRST_ACCOUNT_SUB_PATH
} from 'yoroi-extension-ledger-bridge';
// TODO [LEDGER]: replace by npm module import
import type {
  GetVersionResponse,
  GetExtendedPublicKeyResponse,
} from 'yoroi-extension-ledger-bridge';

import Config from '../../config';
import environment from '../../environment';

import Store from '../base/Store';
import Wallet from '../../domain/Wallet';
import LocalizedRequest from '../lib/LocalizedRequest';

import type {
  CreateHardwareWalletRequest,
  CreateHardwareWalletResponse,
} from '../../api/common';

// This is actually just an interface
import {
  HWConnectStoreTypes,
  StepState,
  ProgressStep,
  ProgressInfo,
  HWDeviceInfo
} from '../../types/HWConnectStoreTypes';

import globalMessages from '../../i18n/global-messages';
import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import { CheckAdressesInUseApiError } from '../../api/ada/errors';

import { getIFrame, prepareLedgerBridger } from '../../utils/iframeHandler';

import {
  Logger,
  stringifyData,
  stringifyError
} from '../../utils/logging';

const messages = defineMessages({
  saveError101: {
    id: 'wallet.ledger.dialog.step.save.error.101',
    defaultMessage: '!!!Failed to save. Please check your Internet connection and retry.',
    description: '<Failed to save. Please check your Internet connection and retry.> on the Connect to Ledger Hardware Wallet dialog.'
  },
});

/** TODO: TrezorConnectStore and LedgerConnectStore has many common methods
  * try to make a common base class */
export default class LedgerConnectStore extends Store implements HWConnectStoreTypes {

  // =================== VIEW RELATED =================== //
  @observable progressInfo: ProgressInfo;

  error: ?LocalizableError;

  hwDeviceInfo: ?HWDeviceInfo;

  ledgerBridge: LedgerBridge;

  get defaultWalletName(): string {
    // Ledger doesn’t provide any device name so using hard-coded name
    return Config.wallets.hardwareWallet.ledgerNanoS.DEFAULT_WALLET_NAME;
  }

  get isActionProcessing(): boolean {
    return this.progressInfo.stepState === StepState.PROCESS;
  }
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createHWRequest: LocalizedRequest<any> =
    new LocalizedRequest(this.api.ada.createHardwareWallet);

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
      this.ledgerBridge = new LedgerBridge(getIFrame(YOROI_LEDGER_BRIDGE_IFRAME_NAME));
    }
  }

  teardown(): void {
    this._reset();
    super.teardown();
  }

  @action _reset = (): void => {
    this.progressInfo = {
      currentStep: ProgressStep.ABOUT,
      stepState: StepState.LOAD,
    };

    this.error = undefined;
    this.hwDeviceInfo = undefined;
  };

  @action _cancel = (): void => {
    this.teardown();
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
      await prepareLedgerBridger(this.ledgerBridge);

      this.hwDeviceInfo = undefined;

      const versionResp: GetVersionResponse = await this.ledgerBridge.getVersion();
      Logger.debug(stringifyData(versionResp));

      // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#examples
      Logger.debug(stringifyData(CARDANO_FIRST_ACCOUNT_SUB_PATH));

      // get Cardano's first account's
      // i.e hdPath = [2147483692, 2147485463, 2147483648]
      const extendedPublicKeyResp: GetExtendedPublicKeyResponse
        = await this.ledgerBridge.getExtendedPublicKey(CARDANO_FIRST_ACCOUNT_SUB_PATH);
      Logger.debug(stringifyData(extendedPublicKeyResp));

      // TODP: Delete. Debug purposes
      const firstAdressHDPath = [...CARDANO_FIRST_ACCOUNT_SUB_PATH, 0, 0];
      const address = await this.ledgerBridge.deriveAddress(firstAdressHDPath);
      Logger.debug(stringifyData(address));

      this.hwDeviceInfo = this._normalizeHWResponse(versionResp, extendedPublicKeyResp);

      this._goToSaveLoad();
      Logger.info('Ledger device OK');
    } catch (error) {
      this._handleConnectError(error);
    }
  };

  _normalizeHWResponse = (
    versionResp: GetVersionResponse,
    extendedPublicKeyResp: GetExtendedPublicKeyResponse
  ): HWDeviceInfo => {
    if (!this._validateHWResponse(versionResp, extendedPublicKeyResp)) {
      throw new UnexpectedError();
    }

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
    let valid = true;

    // TODO [LEDGER]: check validity
    // IDEA: We could also check that the address generated by Ledger matches the one generated by us.
    return valid;
  };

  _handleConnectError = (error): void => {
    Logger.error(`LedgerConnectStore::_checkAndStoreHWDeviceInfo ${stringifyError(error)}`);

    this.hwDeviceInfo = undefined;

    if (error instanceof LocalizableError) {
      this.error = error;
    } else {
      this.error = new UnexpectedError();
    }

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
      const ledgerWallet: CreateHardwareWalletResponse =
        await this.createHWRequest.execute(reqParams).promise;

      if (ledgerWallet) {
        await this._onSaveSucess(ledgerWallet);
      } else {
        // this Error will be converted to LocalizableError()
        throw new Error();
      }
    } catch (error) {
      Logger.error(`LedgerConnectStore::_saveHW::error ${stringifyError(error)}`);

      if (error instanceof CheckAdressesInUseApiError) {
        // redirecting CheckAdressesInUseApiError -> saveError101
        // because for user saveError101 is more meaningful in this context
        this.error = new LocalizableError(messages.saveError101);
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
      throw new UnexpectedError();
    }

    return {
      walletName,
      publicMasterKey: this.hwDeviceInfo.publicMasterKey,
      hwFeatures: this.hwDeviceInfo.hwFeatures
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

    // Load the Yoroi with Trezor Icon
    this.stores.topbar.initCategories();

    // show success notification
    wallets.showLedgerNanoSWalletIntegratedNotification();

    // TODO: [TREZOR] not sure if it actully destroying this Store ??
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
