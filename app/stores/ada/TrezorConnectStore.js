// @flow
import { observable, action, computed } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';

import Config from '../../config';

import TrezorConnect, { UI_EVENT, DEVICE_EVENT } from 'trezor-connect';
import type { DeviceMessage, Features, UiMessage } from 'trezor-connect';
import type { CardanoGetPublicKey } from '../../../node_modules/trezor-connect/lib/types';

import Store from '../base/Store';
import environment from '../../environment';

import Request from '../lib/LocalizedRequest';

import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import { CheckAdressesInUseApiError } from '../../api/ada/errors';

const messages = defineMessages({
  connectError999: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.999',
    defaultMessage: '!!!Something unexpected happened, please retry.',
    description: '<Something unexpected happened, please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError101: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.101',
    defaultMessage: '!!!Falied to connect trezor.io. Please check your Internet connection and retry.',
    description: '<Falied to connect trezor.io. Please check your Internet connection and retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError102: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.102',
    defaultMessage: '!!!Necessary permissions were not granted by the user. Please retry.',
    description: '<Necessary permissions were not granted by the user. Please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError103: {
    id: 'wallet.trezor.dialog.trezor.step.connect.error.103',
    defaultMessage: '!!!Cancelled. Please retry.',
    description: '<Cancelled. Please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

export type ProgressStep = 0 | 1 | 2;
export const ProgressStepOption = {
  ABOUT: 0,
  CONNECT: 1,
  SAVE: 2,
};

export type StepState = 0 | 1 | 9;
export const StepStateOption = {
  LOAD: 0,
  PROCESS: 1,
  ERROR: 9,
};

export type ProgressInfo = {
  currentStep: ProgressStep,
  stepState: StepState,
}

type TrezorDeviceInfo = {
  valid: boolean,
  error: ?LocalizableError,
  // Trezor device CardanoGetPublicKey object
  cardanoGetPublicKeyResult: ?CardanoGetPublicKey,
  // Trezor device Features object
  features: ?Features
};

/** */
export default class TrezorConnectStore extends Store {

  // TODO comment
  @observable progressInfo: ProgressInfo;
  // TODO comment
  @observable error: ?LocalizableError;

  @computed get isActionProcessing() {
    return this.progressInfo.stepState === StepStateOption.PROCESS;
  }

  @computed get defaultWalletName() {
    let defaultWalletName = '';
    if(this.trezorDeviceInfo && this.trezorDeviceInfo.features) {
      defaultWalletName = this.trezorDeviceInfo.features.label;
    }
    return defaultWalletName;
  }

  // device info which will be used to create wallet (except wallet name)
  // wallet name will be fetched from the user using form
  trezorDeviceInfo: ?TrezorDeviceInfo;
  // Trezor device DeviceMessage event object
  trezorEventDevice: ?DeviceMessage;

  setup() {
    this._reset();
    const action = this.actions.ada.trezorConnect;
    action.cancel.listen(this._cancel);
    action.submitAbout.listen(this._submitAbout);
    action.goBacktToAbout.listen(this._goBacktToAbout);    
    action.submitConnect.listen(this._submitConnect);
    action.submitSave.listen(this._submitSave);
  };

  teardown() {
    this.trezorDeviceInfo = undefined;
    this._removeTrezorConnectEventListeners();
    this._reset();
    super.teardown();
  }

  @action _reset = () => {
    this.progressInfo = {
      currentStep : ProgressStepOption.ABOUT,
      stepState: StepStateOption.LOAD,
    };
    this.trezorEventDevice = undefined;
  }

  @action _cancel = async () => {
    this.teardown();
  };

  @action _submitAbout = async () => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStepOption.CONNECT;
    this.progressInfo.stepState = StepStateOption.LOAD;
  };

  @action _goBacktToAbout = async () => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStepOption.ABOUT;
    this.progressInfo.stepState = StepStateOption.LOAD;
  };  

  @action _submitConnect = async () => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStepOption.CONNECT;
    this.progressInfo.stepState = StepStateOption.PROCESS;
    this._checkAndStoreTrezorDeviceInfo();
  };

  @action _goToConnectError = async () => {
    if(this.trezorDeviceInfo) {
      this.error = this.trezorDeviceInfo.error;
    }
    this.progressInfo.currentStep = ProgressStepOption.CONNECT;
    this.progressInfo.stepState = StepStateOption.ERROR;
  }

  @action _goToSaveLoad = async () => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStepOption.SAVE;
    this.progressInfo.stepState = StepStateOption.LOAD;
  }

  @action _submitSave = async (walletName: string) => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStepOption.SAVE;
    this.progressInfo.stepState = StepStateOption.PROCESS;

    if(this.trezorDeviceInfo && 
      this.trezorDeviceInfo.cardanoGetPublicKeyResult && 
      this.trezorDeviceInfo.features) {
      const walletData = {
        walletName,
        publicMasterKey: this.trezorDeviceInfo.cardanoGetPublicKeyResult.payload.publicKey,
        deviceFeatures: this.trezorDeviceInfo.features
      };
      this._saveTrezor(walletData);
    }
  };

  @action _goToSaveError = async () => {
    if(this.trezorDeviceInfo) {
      this.error = this.trezorDeviceInfo.error;
    }
    this.progressInfo.currentStep = ProgressStepOption.SAVE;
    this.progressInfo.stepState = StepStateOption.ERROR;
  }

  _checkAndStoreTrezorDeviceInfo = async () => {
    let cardanoGetPublicKeyResp : CardanoGetPublicKey | any = null;

    try {
      this._addTrezorConnectEventListeners();

      cardanoGetPublicKeyResp = await TrezorConnect.cardanoGetPublicKey({
        path: Config.trezor.DEFAULT_CARDANO_PATH
      });
    } catch (error) {
      console.error('[TREZOR] TrezorConnectError cardanoGetPublicKey : ' + JSON.stringify(error, null, ''));
    } finally {
      // TODO: handle when user forcefully closed trezor.io window
      this._removeTrezorConnectEventListeners();

      const trezorEventDevice = { ...this.trezorEventDevice };
      const trezorValidity = this._validateTrezor(cardanoGetPublicKeyResp, trezorEventDevice);

      this.trezorDeviceInfo = Object.assign({}, trezorValidity);
      if (this.trezorDeviceInfo.valid) {
        // It's a valid trezor device, go to Save Load state
        this.trezorDeviceInfo.cardanoGetPublicKeyResult = cardanoGetPublicKeyResp;
        if (trezorEventDevice.payload.type === 'acquired') {
          this.trezorDeviceInfo.features = trezorEventDevice.payload.features;
        }
        this._goToSaveLoad();
      } else {
        // It's an invalid trezor device, go to Connect Error state
        this.trezorDeviceInfo.cardanoGetPublicKeyResult = null;
        this.trezorDeviceInfo.features = null;
        this._goToConnectError();
      }
    }
  }

  _addTrezorConnectEventListeners = () => {
    if (TrezorConnect) {
      TrezorConnect.on(DEVICE_EVENT, this._onTrezorDeviceEvent);
      TrezorConnect.on(UI_EVENT, this._onTrezorUIEvent);
    } else {
      throw new Error('TrezorConnect not installed');
    }
  }

  _removeTrezorConnectEventListeners = () => {
    if (TrezorConnect) {
      TrezorConnect.off(DEVICE_EVENT, this._onTrezorDeviceEvent);
      TrezorConnect.off(UI_EVENT, this._onTrezorUIEvent);
    }
  }

  _onTrezorDeviceEvent = (event: DeviceMessage) => {
    console.log(`[TREZOR] DEVICE_EVENT: ${event.type}`);
    this.trezorEventDevice = event;
  }

  _onTrezorUIEvent = (event: UiMessage) => {
    console.log(`[TREZOR] UI_EVENT: ${event.type}`);
    // TODO : https://github.com/Emurgo/yoroi-frontend/issues/126
    // if(event.type === CLOSE_UI_WINDOW &&
    //   this.progressState === ProgressStateOption.CONNECT_START &&
    //   this.publicKeyInfo.valid === false) {
    //   this.progressState = ProgressStateOption.CONNECT_ERROR;
    //   this.publicKeyInfo.errorId = 'trezord forcefully stopped';
    //   this._updateState();
    // }
  }

  /** Validates the compatibility of data which we have received from Trezor */
  _validateTrezor = (
    cardanoGetPublicKeyResp: CardanoGetPublicKey,
    trezorEventDevice: DeviceMessage
  ): {
      valid: boolean,
      error: ?LocalizableError
    } => {
    const trezorValidity = {};
    trezorValidity.valid = false;

    if (!cardanoGetPublicKeyResp.success) {
      switch (cardanoGetPublicKeyResp.payload.error) {
        case 'Iframe timeout':
          trezorValidity.error = messages.connectError101;
          break;
        case 'Permissions not granted':
          trezorValidity.error = messages.connectError102;
          break;
        case 'Cancelled':
        case 'Popup closed':
          trezorValidity.error = messages.connectError103;
          break;
        default:
          // connectError999 = Something unexpected happened
          trezorValidity.error = messages.connectError999;
          break;
      }
    }

    if (!trezorValidity.error && cardanoGetPublicKeyResp.payload.publicKey.length <= 0) {
      trezorValidity.error = messages.connectError999;
    }

    if (!trezorValidity.error && trezorEventDevice.payload.type !== 'acquired') {
      trezorValidity.error = messages.connectError999;
    }

    if (!trezorValidity.error) {
      trezorValidity.valid = true;
    }

    return trezorValidity;
  }

  _saveTrezor = async (params: {
    publicMasterKey: string,
    walletName: string,
    deviceFeatures: Features,
  }) => {
    this.actions[environment.API].wallets.connectTrezor.trigger(params);
  }
}
