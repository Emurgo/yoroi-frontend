// @flow

// Handles Connect to Ledger Hardware Wallet dialog

import { observable, action } from 'mobx';
import { defineMessages } from 'react-intl';

import LedgerBridge from 'yoroi-extension-ledger-bridge';

// import TrezorConnect, { UI_EVENT, DEVICE_EVENT } from 'trezor-connect';
// import type { DeviceMessage, Features, UiMessage } from 'trezor-connect';

import Config from '../../config';
import environment from '../../environment';

import Store from '../base/Store';
import Wallet from '../../domain/Wallet';
import LocalizedRequest from '../lib/LocalizedRequest';

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
  stringifyError
} from '../../utils/logging';

// import type { CreateTrezorWalletResponse } from '../../api/common';

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

  HWDeviceInfo: ?HWDeviceInfo;

  // Ledger device label
  get defaultWalletName(): string {
    // Ledger doesn’t provide any name
    return '';
  }

  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  // TODO: type CreateLedgerWalletResponse
  createHWRequest: LocalizedRequest<any> =
    new LocalizedRequest(this.api.ada.createHardwareWallet); // Update to Ledger

  /** While ledger wallet creation is taking place, we need to block users from starting a
    * trezor wallet creation on a seperate wallet and explain to them why the action is blocked */
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

    // /** Preinitialization of TrezorConnect API will result in faster first response */
    // try {
    //   LedgerConnect.init({});
    // } catch (error) {
    //   Logger.error(`LedgerConnectStore::setup:error: ${stringifyError(error)}`);
    // }
  }

  teardown(): void {
    // if (!this.createLedgerWalletRequest.isExecuting) {
    //   // Ledger Connect request should be reset only in case connect is finished/errored
    //   this.createLedgerWalletRequest.reset();
    // }

    // this._removeLedgerConnectEventListeners();

    this._reset();
    super.teardown();
  }

  @action _reset = (): void => {
    this.progressInfo = {
      currentStep: ProgressStep.ABOUT,
      stepState: StepState.LOAD,
    };
    this.error = undefined;
    this.HWDeviceInfo = undefined;
    // this.ledgerEventDevice = undefined;
  };

  @action _cancel = (): void => {
    this.teardown();
  };

  // =================== ABOUT =================== //
  /** ABOUT dialog submit(Next button) */
  @action _submitAbout = (): void => {
    this.error = undefined;
    // this.HWEventDevice = undefined;
    // this._removeHWConnectEventListeners();
    // this._addHWConnectEventListeners();
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

  @action _goToConnectError = (): void => {
    this.progressInfo.currentStep = ProgressStep.CONNECT;
    this.progressInfo.stepState = StepState.ERROR;
  };

  _checkAndStoreHWDeviceInfo = async (): Promise<void> => {
    try {
      // let ledgerBridge = new LedgerBridge();

      // let version = ledgerBridge.getVersion();
      // console.log('ledger version');

    } catch (error) {
      Logger.error(`LedgerConnectStore::_checkAndStoreledgerDeviceInfo ${stringifyError(error)}`);
    } finally {
      console.log('_checkAndStoreHWDeviceInfo');
    }
  };

  _addHWConnectEventListeners = (): void => {
    // if (TrezorConnect) {
    //   TrezorConnect.on(DEVICE_EVENT, this._onTrezorDeviceEvent);
    //   TrezorConnect.on(UI_EVENT, this._onTrezorUIEvent);
    // } else {
    Logger.error('LedgerConnectStore::_addTrezorConnectEventListeners:: TrezorConnect not installed');
    // }
  };

  _removeHWConnectEventListeners = (): void => {
    // if (TrezorConnect) {
    //   TrezorConnect.off(DEVICE_EVENT, this._onTrezorDeviceEvent);
    //   TrezorConnect.off(UI_EVENT, this._onTrezorUIEvent);
    // }
  };

  _onHWDeviceEvent = (event: any): void => {
    // Logger.debug(`LedgerConnectStore:: DEVICE_EVENT: ${event.type}`);
    // this.HWEventDevice = event;
  };

  _onHWUIEvent = (event: any): void => {
    // Logger.debug(`LedgerConnectStore:: UI_EVENT: ${event.type}`);
    // TODO: [TREZOR] https://github.com/Emurgo/yoroi-frontend/issues/126
    // if(event.type === CLOSE_UI_WINDOW &&
    //   this.progressState === ProgressStateOption.CONNECT_START &&
    //   this.publicKeyInfo.valid === false) {
    //   this.progressState = ProgressStateOption.CONNECT_ERROR;
    //   this.publicKeyInfo.errorId = 'trezord forcefully stopped';
    //   this._updateState();
    // }
  };

  _validateResponse = (): void => {

  }

  /** Validates the compatibility of data which we have received from Trezor */
  _validateHW = (
    ledgerResp: any,
    ledgerEventDevice: any, // DeviceMessage
  ): {
      valid: boolean,
      error: ?LocalizableError
    } => {
    const ledgerValidity = {};
    ledgerValidity.valid = false;
    ledgerValidity.error = null;

    // if (!trezorResp.success) {
    //   switch (trezorResp.payload.error) {
    //     case 'Iframe timeout':
    //       trezorValidity.error = new LocalizableError(globalMessages.trezorError101);
    //       break;
    //     case 'Permissions not granted':
    //       trezorValidity.error = new LocalizableError(globalMessages.trezorError102);
    //       break;
    //     case 'Cancelled':
    //     case 'Popup closed':
    //       trezorValidity.error = new LocalizableError(globalMessages.trezorError103);
    //       break;
    //     default:
    //       // Something unexpected happened
    //       Logger.error(`LedgerConnectStore::_validateTrezor::error: ${trezorResp.payload.error}`);
    //       trezorValidity.error = new UnexpectedError();
    //       break;
    //   }
    // }

    // if (!trezorValidity.error
    //   && trezorResp.payload.publicKey.length <= 0) {
    //   // Something unexpected happened
    //   Logger.error(`LedgerConnectStore::_validateTrezor::error: invalid public key`);
    //   trezorValidity.error = new UnexpectedError();
    // }

    // if (!trezorValidity.error
    //   && (ledgerEventDevice == null
    //   || ledgerEventDevice.payload == null
    //   || ledgerEventDevice.payload.type !== 'acquired'
    //   || ledgerEventDevice.payload.features == null)) {
    //   // Something unexpected happened
    //   Logger.error(`LedgerConnectStore::_validateTrezor::error: invalid device event`);
    //   trezorValidity.error = new UnexpectedError();
    // }

    // if (!trezorValidity.error) {
    //   trezorValidity.valid = true;
    // }

    return ledgerValidity;
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

    if (this.HWDeviceInfo
      && this.HWDeviceInfo.publicKey
      && this.HWDeviceInfo.features) {
      const walletData = {
        walletName,
        publicMasterKey: this.HWDeviceInfo.publicKey,
        deviceFeatures: this.HWDeviceInfo.features
      };
      this._saveHW(walletData);
    }
  };

  @action _goToSaveError = (): void => {
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.ERROR;
  };

  /** creates new wallet and loads it */
  _saveHW = async (params: {
    publicMasterKey: string,
    walletName: string,
    deviceFeatures: HWFeatures,
  }): Promise<void>  => {
    // try {
    //   Logger.debug('LedgerConnectStore::_saveTrezor:: stated');
    //   this._setIsCreateTrezorWalletActive(true);
    //   this.createLedgerWalletRequest.reset();

    //   const trezorWallet: Wallet = await this.createLedgerWalletRequest.execute(params).promise;
    //   if (trezorWallet) {
    //     await this._onSaveSucess(trezorWallet);
    //   } else {
    //     // this Error will be converted to LocalizableError()
    //     throw new Error();
    //   }
    // } catch (error) {
    //   if (error instanceof CheckAdressesInUseApiError) {
    //     // redirecting CheckAdressesInUseApiError -> saveError101
    //     // because for user saveError101 is more meaningful in this context
    //     this.error = new LocalizableError(messages.saveError101);
    //   } else if (error instanceof LocalizableError) {
    //     this.error = error;
    //   } else {
    //     // some unknow error
    //     this.error = new LocalizableError(messages.error999);
    //   }
    //   this._goToSaveError();
    //   Logger.error(`LedgerConnectStore::_saveTrezor::error ${stringifyError(error)}`);
    // } finally {
    //   this.createLedgerWalletRequest.reset();
    //   this._setIsCreateTrezorWalletActive(false);
    // }
  };

  async _onSaveSucess(HWWallet: Wallet): Promise<void> {
    // close the active dialog
    Logger.debug('LedgerConnectStore::_saveTrezor success, closing dialog');
    this.actions.dialogs.closeActiveDialog.trigger();

    const { wallets } = this.stores.substores[environment.API];
    await wallets._patchWalletRequestWithNewWallet(HWWallet);

    // goto the wallet transactions page
    Logger.debug('LedgerConnectStore::_saveTrezor setting new walles as active wallet');
    wallets.goToWalletRoute(HWWallet.id);

    // fetch its data
    Logger.debug('LedgerConnectStore::_saveTrezor loading wallet data');
    wallets.refreshWalletsData();

    // Load the Yoroi with Trezor Icon
    this.stores.topbar.initCategories();

    // show success notification
    wallets.showTrezorTWalletIntegratedNotification();

    // TODO: [TREZOR] not sure if it actully destroying this Store ??
    this.teardown();
    Logger.info('SUCCESS: Trezor Connected Wallet created and loaded');
  }
  // =================== SAVE =================== //

  // =================== API =================== //
  @action _setIsCreateHWActive = (active: boolean): void => {
    // this.isCreateTrezorWalletActive = active;
  };
  // =================== API =================== //
}
