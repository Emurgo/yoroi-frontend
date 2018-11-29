// @flow

// Handles Connect to Trezor Hardware Wallet dialog and 
// uses 

import { observable, action, runInAction, computed } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';

import Config from '../../config';

import TrezorConnect, { UI_EVENT, DEVICE_EVENT } from 'trezor-connect';
import type { DeviceMessage, Features, UiMessage } from 'trezor-connect';
import type { CardanoGetPublicKey } from '../../../node_modules/trezor-connect/lib/types';

import Store from '../base/Store';
import environment from '../../environment';

import { ROUTES } from '../../routes-config';
import Request from '../lib/LocalizedRequest';

import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import { CheckAdressesInUseApiError } from '../../api/ada/errors';

import type {
  ConnectTrezorResponse,
} from '../../api/common';

const messages = defineMessages({
  error999: {
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
  saveError101: {
    id: 'wallet.trezor.dialog.trezor.step.save.error.101',
    defaultMessage: '!!!Falied to save. Please check your Internet connection and retry.',
    description: '<Falied to save. Please check your Internet connection and retry.> on the Connect to Trezor Hardware Wallet dialog.'
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
};

type TrezorDeviceInfo = {
  valid: boolean,
  // Trezor device CardanoGetPublicKey object
  cardanoGetPublicKeyResult: ?CardanoGetPublicKey,
  // Trezor device Features object
  features: ?Features
};

export default class TrezorConnectStore extends Store {

  //============ VIEW RELATED ============
  // the only observable which manages state change
  @observable progressInfo: ProgressInfo;

  // only in ERROR state it will hold LocalizableError object
  error: ?LocalizableError;

  get isActionProcessing() {
    return this.progressInfo.stepState === StepStateOption.PROCESS;
  };

  // device info which will be used to create wallet (except wallet name)
  // also it holds Trezor device label which is used as default wallet name
  trezorDeviceInfo: ?TrezorDeviceInfo;

  // Trezor device label
  get defaultWalletName() {
    let defaultWalletName = '';
    if(this.trezorDeviceInfo && this.trezorDeviceInfo.features) {
      defaultWalletName = this.trezorDeviceInfo.features.label;
    }
    return defaultWalletName;
  };

  // holds Trezor device DeviceMessage event object
  trezorEventDevice: ?DeviceMessage;
  //============ VIEW RELATED ============

  //============ API RELATED =============
  @observable trezorConnectRequest:
  Request<ConnectTrezorResponse> = new Request(this.api.ada.connectTrezor);
  //============ API RELATED =============

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
    this._removeTrezorConnectEventListeners();
    if (TrezorConnect) {
      TrezorConnect.dispose();
    }    
    this._reset();
    super.teardown();
  };

  @action _reset = () => {
    this.progressInfo = {
      currentStep : ProgressStepOption.ABOUT,
      stepState: StepStateOption.LOAD,
    };
    this.error = undefined;
    this.trezorDeviceInfo = undefined;
    this.trezorEventDevice = undefined;
  };

  @action _cancel = () => {
    this.teardown();
  };

  //=============== ABOUT ===============

  /** ABOUT dialog submit(Next button) */
  @action _submitAbout = () => {
    this.error = undefined;
    this.progressInfo.currentStep = ProgressStepOption.CONNECT;
    this.progressInfo.stepState = StepStateOption.LOAD;
  };

  //=============== CONNECT ===============
  
  /** CONNECT dialog goBack button */
  @action _goBacktToAbout = () => {
    this.error = undefined;
    this.progressInfo.currentStep = ProgressStepOption.ABOUT;
    this.progressInfo.stepState = StepStateOption.LOAD;
  };

  /** CONNECT dialog submit (Connect button) */
  @action _submitConnect = () => {
    this.error = undefined;
    this.progressInfo.currentStep = ProgressStepOption.CONNECT;
    this.progressInfo.stepState = StepStateOption.PROCESS;
    this._checkAndStoreTrezorDeviceInfo();
  };

  @action _goToConnectError = () => {
    this.progressInfo.currentStep = ProgressStepOption.CONNECT;
    this.progressInfo.stepState = StepStateOption.ERROR;
  };

  _checkAndStoreTrezorDeviceInfo = async () => {
    let cardanoGetPublicKeyResp : CardanoGetPublicKey | any = null;

    try {
      this.trezorEventDevice = undefined;
      this._addTrezorConnectEventListeners();

      cardanoGetPublicKeyResp = await TrezorConnect.cardanoGetPublicKey({
        path: Config.trezor.DEFAULT_CARDANO_PATH
      });
    } catch (error) {
      console.error('[TREZOR] TrezorConnectError cardanoGetPublicKey : ' + JSON.stringify(error, null, ''));
    } finally {
      // TODO: handle when user forcefully close Connect to Trezor Hardware Wallet 
      // while connection in in progress
      this._removeTrezorConnectEventListeners();

      const trezorEventDevice = { ...this.trezorEventDevice };
      const trezorValidity = this._validateTrezor(cardanoGetPublicKeyResp, trezorEventDevice);

      this.trezorDeviceInfo = {};
      this.trezorDeviceInfo.valid = trezorValidity.valid;
      if (this.trezorDeviceInfo.valid) {
        // It's a valid trezor device, go to Save Load state
        this.trezorDeviceInfo.cardanoGetPublicKeyResult = cardanoGetPublicKeyResp;
        if (trezorEventDevice.payload.type === 'acquired') {
          this.trezorDeviceInfo.features = trezorEventDevice.payload.features;
        }
        this._goToSaveLoad();
      } else {
        // It's an invalid trezor device, go to Connect Error state
        this.error = trezorValidity.error;
        this.trezorDeviceInfo.cardanoGetPublicKeyResult = undefined;
        this.trezorDeviceInfo.features = undefined;
        this._goToConnectError();
      }
    }
  };

  _addTrezorConnectEventListeners = () => {
    if (TrezorConnect) {
      TrezorConnect.on(DEVICE_EVENT, this._onTrezorDeviceEvent);
      TrezorConnect.on(UI_EVENT, this._onTrezorUIEvent);
    } else {
      console.error(`[TREZOR]::_addTrezorConnectEventListeners::TrezorConnect not installed`);
    }
  };

  _removeTrezorConnectEventListeners = () => {
    if (TrezorConnect) {
      TrezorConnect.off(DEVICE_EVENT, this._onTrezorDeviceEvent);
      TrezorConnect.off(UI_EVENT, this._onTrezorUIEvent);
    }
  };

  _onTrezorDeviceEvent = (event: DeviceMessage) => {
    console.log(`[TREZOR] DEVICE_EVENT: ${event.type}`);
    this.trezorEventDevice = event;
  };

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
  };

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
          trezorValidity.error = messages.error999;
          break;
      }
    }

    if (!trezorValidity.error && cardanoGetPublicKeyResp.payload.publicKey.length <= 0) {
      trezorValidity.error = messages.error999;
    }

    if (!trezorValidity.error && trezorEventDevice.payload.type !== 'acquired') {
      trezorValidity.error = messages.error999;
    }

    if (!trezorValidity.error) {
      trezorValidity.valid = true;
    }

    return trezorValidity;
  };

  //=============== SAVE ===============

  @action _goToSaveLoad = () => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStepOption.SAVE;
    this.progressInfo.stepState = StepStateOption.LOAD;
  };

  /** SAVE dialog submit (Save button) */
  @action _submitSave = (walletName: string) => {
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

  @action _goToSaveError = () => {
    this.progressInfo.currentStep = ProgressStepOption.SAVE;
    this.progressInfo.stepState = StepStateOption.ERROR;
  };

  /** creates new wallet and loads it */
  _saveTrezor = async (params: {
    publicMasterKey: string,
    walletName: string,
    deviceFeatures: Features,
  }) => {
    try {
      this.trezorConnectRequest.reset();
      const trezorWallet = await this.trezorConnectRequest.execute(params).promise;
      if(trezorWallet) {
        // close the active dialog
        this.actions.dialogs.closeActiveDialog.trigger();
        // 
        const { wallets } = this.stores.substores[environment.API];
        await wallets._patchWalletRequestWithNewWallet(trezorWallet);
        // go to the wallet transactions page
        wallets.goToWalletRoute(trezorWallet.id);
        // fetch its data
        wallets.refreshWalletsData();
        // TODO: not sure if it actully distructing this Store??
        this.teardown()
      }
    } catch (error) {
      if (error instanceof CheckAdressesInUseApiError) {
        // redirecting CheckAdressesInUseApiError -> saveError101
        // because for user saveError101 is more meaningful in this context
        this.error = messages.saveError101;
      } else {
        // some unknow error
        this.error = messages.error999;
      }
      this._goToSaveError();
    } finally {
      this.trezorConnectRequest.reset();
    }
  };
}
