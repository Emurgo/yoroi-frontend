// @flow

// Handles Connect to Ledger Hardware Wallet dialog

import { observable, action, computed } from 'mobx';
import { defineMessages } from 'react-intl';

import {
  LedgerBridge,
  makeCardanoBIP44Path
} from 'yoroi-extension-ledger-bridge';
// TODO [LEDGER]: replace types by npm module import
import type {
  GetVersionResponse,
  GetExtendedPublicKeyResponse,
  BIP32Path
} from 'yoroi-extension-ledger-bridge/lib/adaTypes';

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
  ProgressStep
} from '../../types/HWConnectStoreTypes';
import type {
  ProgressInfo,
  HWDeviceInfo,
  HWFeatures
} from '../../types/HWConnectStoreTypes'; // StepStateEnum, ProgressStepEnum,

import globalMessages from '../../i18n/global-messages';
import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import { CheckAdressesInUseApiError } from '../../api/ada/errors';

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

export default class LedgerConnectStore extends Store implements HWConnectStoreTypes {

  // =================== VIEW RELATED =================== //
  @observable progressInfo: ProgressInfo;

  error: ?LocalizableError;

  get isActionProcessing(): boolean {
    return this.progressInfo.stepState === StepState.PROCESS;
  }

  hwDeviceInfo: ?HWDeviceInfo;

  // Ledger doesn’t provide any device name so using hard-coded name
  get defaultWalletName(): string {
    return Config.wallets.hardwareWallet.ledgerNanoS.DEFAULT_WALLET_NAME;
  }

  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createHWRequest: LocalizedRequest<any> =
    new LocalizedRequest(this.api.ada.createHardwareWallet);

  /** While ledger wallet creation is taking place, we need to block users from starting a
    * ledger wallet creation on a seperate wallet and explain to them why the action is blocked */
  @observable isCreateWalletActive: boolean = false;
  // =================== API RELATED =================== //

  setup() {
    this._reset();
    const ledgerConnectAction = this.actions.ada.ledgerConnect;
    ledgerConnectAction.cancel.listen(this._cancel);
    ledgerConnectAction.submitAbout.listen(this._submitAbout);
    ledgerConnectAction.goBackToAbout.listen(this._goBackToAbout);
    ledgerConnectAction.submitConnect.listen(this._submitConnect);
    ledgerConnectAction.submitSave.listen(this._submitSave);

    this.hwDeviceInfo = {
      valid: false,
      publicKey: null,
      features: null
    };
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

  // TODO [TREZOR]: this is temporary solution, fix later
  _wait = async ms => new Promise((resolve) => setTimeout(resolve, ms));

  _checkAndStoreHWDeviceInfo = async (): Promise<void> => {
    try {
      const ledgerBridge = new LedgerBridge();
      // TODO [TREZOR]: for iframe not initialized (this is temporary solution, fix later)
      await this._wait(1000);

      this.hwDeviceInfo = undefined;

      const versionResp: GetVersionResponse = await ledgerBridge.getVersion();
      Logger.debug(stringifyData(versionResp));

      // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#examples
      const hdPath: BIP32Path = makeCardanoBIP44Path(0, false, 0);
      Logger.debug(stringifyData(hdPath));

      // get Cardano's first account's first public key(non change)
      // i.e hdPath = [2147483692, 2147485463, 2147483648, 0, 0]
      const extendedPublicKeyResp: GetExtendedPublicKeyResponse
        = await ledgerBridge.getExtendedPublicKey(hdPath);
      Logger.debug(stringifyData(extendedPublicKeyResp));

      if (this._isValidHW(versionResp, extendedPublicKeyResp)) {
        this.hwDeviceInfo = {
          valid: true,
          publicKey: extendedPublicKeyResp.publicKeyHex + extendedPublicKeyResp.chainCodeHex,
          features: {
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

        Logger.info('Ledger device OK');
        this._goToSaveLoad();
      }
    } catch (error) {
      Logger.error(`LedgerConnectStore::_checkAndStoreHWDeviceInfo ${stringifyError(error)}`);
      this._handleConnectError(error);
    }
  };

  _isValidHW = (
    versionResp: GetVersionResponse,
    extendedPublicKeyResp: GetExtendedPublicKeyResponse
  ): boolean => {
    let valid = true;

    // TODO [LEDGER]: check validity
    return valid;
  };

  _handleConnectError = (error): void => {
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
      Logger.debug('LedgerConnectStore::_saveHW:: stated');
      this._setIsCreateHWActive(true);
      this.createHWRequest.reset();

      const params = this._prepareCreateHWReqParams(walletName);
      const ledgerWallet: CreateHardwareWalletResponse = await this.createHWRequest.execute(params).promise;
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
      || this.hwDeviceInfo.publicKey == null
      || this.hwDeviceInfo.features == null) {
      throw new UnexpectedError();
    }

    return {
      walletName,
      walletHardwareInfo: {
        publicMasterKey: this.hwDeviceInfo.publicKey,
        vendor: this.hwDeviceInfo.features.vendor,
        model: this.hwDeviceInfo.features.vendor,
        deviceId: this.hwDeviceInfo.features.deviceId,
        label: this.hwDeviceInfo.features.label,
        majorVersion: this.hwDeviceInfo.features.majorVersion,
        minorVersion: this.hwDeviceInfo.features.minorVersion,
        patchVersion: this.hwDeviceInfo.features.patchVersion,
        language: this.hwDeviceInfo.features.language,
      }
    };
  };

  async _onSaveSucess(HWWallet: Wallet): Promise<void> {
    // close the active dialog
    Logger.debug('LedgerConnectStore::_onSaveSucess success, closing dialog');
    this.actions.dialogs.closeActiveDialog.trigger();

    const { wallets } = this.stores.substores[environment.API];
    await wallets._patchWalletRequestWithNewWallet(HWWallet);

    // goto the wallet transactions page
    Logger.debug('LedgerConnectStore::_onSaveSucess setting new walles as active wallet');
    wallets.goToWalletRoute(HWWallet.id);

    // fetch its data
    Logger.debug('LedgerConnectStore::_onSaveSucess loading wallet data');
    wallets.refreshWalletsData();

    // Load the Yoroi with Trezor Icon
    this.stores.topbar.initCategories();

    // show success notification
    wallets.showTrezorTWalletIntegratedNotification();

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
    this.isCreateWalletActive = active;
  };
  // =================== API =================== //
}
