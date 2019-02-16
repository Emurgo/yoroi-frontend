// @flow

// Handles Connect to Trezor Hardware Wallet dialog

import { observable, action } from 'mobx';
import { defineMessages } from 'react-intl';

import TrezorConnect, { UI_EVENT, DEVICE_EVENT } from 'trezor-connect';
import type { DeviceMessage, Features, UiMessage } from 'trezor-connect';

import Config from '../../config';
import environment from '../../environment';

import Store from '../base/Store';
import Wallet from '../../domain/Wallet';
import LocalizedRequest from '../lib/LocalizedRequest';

import globalMessages from '../../i18n/global-messages';
import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import { CheckAdressesInUseApiError } from '../../api/ada/errors';

import {
  Logger,
  stringifyError
} from '../../utils/logging';

import type { CreateTrezorWalletResponse } from '../../api/common';

const messages = defineMessages({
  saveError101: {
    id: 'wallet.trezor.dialog.step.save.error.101',
    defaultMessage: '!!!Failed to save. Please check your Internet connection and retry.',
    description: '<Failed to save. Please check your Internet connection and retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
});

type ProgressStepEnum = 0 | 1 | 2;
export const ProgressStep = {
  ABOUT: 0,
  CONNECT: 1,
  SAVE: 2,
};

type StepStateEnum = 0 | 1 | 9;
export const StepState = {
  LOAD: 0,
  PROCESS: 1,
  ERROR: 9,
};

export type ProgressInfo = {
  currentStep: ProgressStepEnum,
  stepState: StepStateEnum,
};

type TrezorDeviceInfo = {
  valid: boolean,
  publicKey: ?string,
  // Trezor device Features object
  features: ?Features
};

export default class TrezorConnectStore extends Store {

  // =================== VIEW RELATED =================== //
  /** the only observable which manages state change */
  @observable progressInfo: ProgressInfo;

  /** only in ERROR state it will hold LocalizableError object */
  error: ?LocalizableError;

  get isActionProcessing(): boolean {
    return this.progressInfo.stepState === StepState.PROCESS;
  }

  /** device info which will be used to create wallet (except wallet name)
    * also it holds Trezor device label which is used as default wallet name
    * final wallet name will be fetched from the user */
  trezorDeviceInfo: ?TrezorDeviceInfo;

  // Trezor device label
  get defaultWalletName(): string {
    let defaultWalletName = '';
    if (this.trezorDeviceInfo && this.trezorDeviceInfo.features) {
      defaultWalletName = this.trezorDeviceInfo.features.label;
    }
    return defaultWalletName;
  }

  /** holds Trezor device DeviceMessage event object, device features will be fetched
    * from this object and will be cloned to TrezorDeviceInfo object */
  trezorEventDevice: ?DeviceMessage;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createTrezorWalletRequest: LocalizedRequest<CreateTrezorWalletResponse> =
    new LocalizedRequest(this.api.ada.createTrezorWallet);

  /** While trezor wallet creation is taking place, we need to block users from starting a
    * trezor wallet creation on a seperate wallet and explain to them why the action is blocked */
  @observable isCreateTrezorWalletActive: boolean = false;
  // =================== API RELATED =================== //

  setup() {
    this._reset();
    const trezorConnectAction = this.actions.ada.trezorConnect;
    trezorConnectAction.cancel.listen(this._cancel);
    trezorConnectAction.submitAbout.listen(this._submitAbout);
    trezorConnectAction.goBackToAbout.listen(this._goBackToAbout);
    trezorConnectAction.submitConnect.listen(this._submitConnect);
    trezorConnectAction.submitSave.listen(this._submitSave);

    /** Preinitialization of TrezorConnect API will result in faster first response */
    try {
      TrezorConnect.init({});
    } catch (error) {
      Logger.error(`TrezorConnectStore::setup:error: ${stringifyError(error)}`);
    }
  }

  teardown(): void {
    if (!this.createTrezorWalletRequest.isExecuting) {
      // Trezor Connect request should be reset only in case connect is finished/errored
      this.createTrezorWalletRequest.reset();
    }

    this._removeTrezorConnectEventListeners();

    this._reset();
    super.teardown();
  }

  @action _reset = (): void => {
    this.progressInfo = {
      currentStep: ProgressStep.ABOUT,
      stepState: StepState.LOAD,
    };
    this.error = undefined;
    this.trezorDeviceInfo = undefined;
    this.trezorEventDevice = undefined;
  };

  @action _cancel = (): void => {
    this.teardown();
  };

  // =================== ABOUT =================== //
  /** ABOUT dialog submit(Next button) */
  @action _submitAbout = (): void => {
    this.error = undefined;
    this.trezorEventDevice = undefined;
    this._removeTrezorConnectEventListeners();
    this._addTrezorConnectEventListeners();
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
    this._checkAndStoreTrezorDeviceInfo();
  };

  @action _goToConnectError = (): void => {
    this.progressInfo.currentStep = ProgressStep.CONNECT;
    this.progressInfo.stepState = StepState.ERROR;
  };

  _checkAndStoreTrezorDeviceInfo = async (): Promise<void> => {
    // TODO: [TREZOR] fix type if possible
    let trezorResp: any;
    try {
      trezorResp = await TrezorConnect.cardanoGetPublicKey({
        path: Config.trezor.DEFAULT_CARDANO_PATH
      });
    } catch (error) {
      Logger.error(`TrezorConnectStore::_checkAndStoreTrezorDeviceInfo ${stringifyError(error)}`);
    } finally {

      const trezorEventDevice = { ...this.trezorEventDevice };
      const trezorValidity = this._validateTrezor(trezorResp, trezorEventDevice);

      this.trezorDeviceInfo = {};
      this.trezorDeviceInfo.valid = trezorValidity.valid;
      if (this.trezorDeviceInfo.valid) {
        // It's a valid trezor device, go to Save Load state
        if (trezorResp && trezorResp.payload) {
          this.trezorDeviceInfo.publicKey = trezorResp.payload.publicKey;
        }
        if (trezorEventDevice.payload && trezorEventDevice.payload.features) {
          this.trezorDeviceInfo.features = trezorEventDevice.payload.features;
        }

        this._goToSaveLoad();
        Logger.info('Trezor device OK');

        // TODO: [TREZOR] handle when user forcefully close Connect to Trezor Hardware Wallet
        // while connection in in progress
        this._removeTrezorConnectEventListeners();
      } else {
        // It's an invalid trezor device, go to Connect Error state
        this.error = trezorValidity.error;
        this.trezorDeviceInfo.publicKey = undefined;
        this.trezorDeviceInfo.features = undefined;
        this._goToConnectError();
        Logger.error(`TrezorConnectStore::_checkAndStoreTrezorDeviceInfo ${stringifyError(this.error)}`);
      }
    }
  };

  _addTrezorConnectEventListeners = (): void => {
    if (TrezorConnect) {
      TrezorConnect.on(DEVICE_EVENT, this._onTrezorDeviceEvent);
      TrezorConnect.on(UI_EVENT, this._onTrezorUIEvent);
    } else {
      Logger.error('TrezorConnectStore::_addTrezorConnectEventListeners:: TrezorConnect not installed');
    }
  };

  _removeTrezorConnectEventListeners = (): void => {
    if (TrezorConnect) {
      TrezorConnect.off(DEVICE_EVENT, this._onTrezorDeviceEvent);
      TrezorConnect.off(UI_EVENT, this._onTrezorUIEvent);
    }
  };

  _onTrezorDeviceEvent = (event: DeviceMessage): void => {
    Logger.debug(`TrezorConnectStore:: DEVICE_EVENT: ${event.type}`);
    this.trezorEventDevice = event;
  };

  _onTrezorUIEvent = (event: UiMessage): void => {
    Logger.debug(`TrezorConnectStore:: UI_EVENT: ${event.type}`);
    // TODO: [TREZOR] https://github.com/Emurgo/yoroi-frontend/issues/126
    // if(event.type === CLOSE_UI_WINDOW &&
    //   this.progressState === ProgressStateOption.CONNECT_START &&
    //   this.publicKeyInfo.valid === false) {
    //   this.progressState = ProgressStateOption.CONNECT_ERROR;
    //   this.publicKeyInfo.errorId = 'trezord forcefully stopped';
    //   this._updateState();
    // }
  };

  /** Validates the compatibility of data which we have received from Trezor */
  _validateTrezor = (
    trezorResp: any,
    trezorEventDevice: DeviceMessage
  ): {
      valid: boolean,
      error: ?LocalizableError
    } => {
    const trezorValidity = {};
    trezorValidity.valid = false;

    if (!trezorResp.success) {
      switch (trezorResp.payload.error) {
        case 'Iframe timeout':
          trezorValidity.error = new LocalizableError(globalMessages.trezorError101);
          break;
        case 'Permissions not granted':
          trezorValidity.error = new LocalizableError(globalMessages.trezorError102);
          break;
        case 'Cancelled':
        case 'Popup closed':
          trezorValidity.error = new LocalizableError(globalMessages.trezorError103);
          break;
        default:
          // Something unexpected happened
          Logger.error(`TrezorConnectStore::_validateTrezor::error: ${trezorResp.payload.error}`);
          trezorValidity.error = new UnexpectedError();
          break;
      }
    }

    if (!trezorValidity.error
      && trezorResp.payload.publicKey.length <= 0) {
      // Something unexpected happened
      Logger.error(`TrezorConnectStore::_validateTrezor::error: invalid public key`);
      trezorValidity.error = new UnexpectedError();
    }

    if (!trezorValidity.error
      && (trezorEventDevice == null
      || trezorEventDevice.payload == null
      || trezorEventDevice.payload.type !== 'acquired'
      || trezorEventDevice.payload.features == null)) {
      // Something unexpected happened
      Logger.error(`TrezorConnectStore::_validateTrezor::error: invalid device event`);
      trezorValidity.error = new UnexpectedError();
    }

    if (!trezorValidity.error) {
      trezorValidity.valid = true;
    }

    return trezorValidity;
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

    if (this.trezorDeviceInfo
      && this.trezorDeviceInfo.publicKey
      && this.trezorDeviceInfo.features) {
      const walletData = {
        walletName,
        publicMasterKey: this.trezorDeviceInfo.publicKey,
        deviceFeatures: this.trezorDeviceInfo.features
      };
      this._saveTrezor(walletData);
    }
  };

  @action _goToSaveError = (): void => {
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.ERROR;
  };

  /** creates new wallet and loads it */
  _saveTrezor = async (params: {
    publicMasterKey: string,
    walletName: string,
    deviceFeatures: Features,
  }): Promise<void>  => {
    try {
      Logger.debug('TrezorConnectStore::_saveTrezor:: stated');
      this._setIsCreateTrezorWalletActive(true);
      this.createTrezorWalletRequest.reset();

      const trezorWallet: Wallet = await this.createTrezorWalletRequest.execute(params).promise;
      if (trezorWallet) {
        await this._onSaveSucess(trezorWallet);
      } else {
        // this Error will be converted to LocalizableError()
        throw new Error();
      }
    } catch (error) {
      if (error instanceof CheckAdressesInUseApiError) {
        // redirecting CheckAdressesInUseApiError -> saveError101
        // because for user saveError101 is more meaningful in this context
        this.error = new LocalizableError(messages.saveError101);
      } else if (error instanceof LocalizableError) {
        this.error = error;
      } else {
        // some unknow error
        this.error = new LocalizableError(messages.error999);
      }
      this._goToSaveError();
      Logger.error(`TrezorConnectStore::_saveTrezor::error ${stringifyError(error)}`);
    } finally {
      this.createTrezorWalletRequest.reset();
      this._setIsCreateTrezorWalletActive(false);
    }
  };

  _onSaveSucess = async (trezorWallet: Wallet) => {
    // close the active dialog
    Logger.debug('TrezorConnectStore::_saveTrezor success, closing dialog');
    this.actions.dialogs.closeActiveDialog.trigger();

    const { wallets } = this.stores.substores[environment.API];
    await wallets._patchWalletRequestWithNewWallet(trezorWallet);

    // goto the wallet transactions page
    Logger.debug('TrezorConnectStore::_saveTrezor setting new walles as active wallet');
    wallets.goToWalletRoute(trezorWallet.id);

    // fetch its data
    Logger.debug('TrezorConnectStore::_saveTrezor loading wallet data');
    wallets.refreshWalletsData();

    // Load the Yoroi with Trezor Icon
    this.stores.topbar.initCategories();

    // show success notification
    wallets.showTrezorTWalletIntegratedNotification();

    // TODO: [TREZOR] not sure if it actully destroying this Store ??
    this.teardown();
    Logger.info('SUCCESS: Trezor Connected Wallet created and loaded');
  };
  // =================== SAVE =================== //

  // =================== API =================== //
  @action _setIsCreateTrezorWalletActive = (active: boolean): void => {
    this.isCreateTrezorWalletActive = active;
  };
  // =================== API =================== //
}
