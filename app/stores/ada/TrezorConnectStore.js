// @flow
// Handles Connect to Trezor Hardware Wallet dialog

import { observable, action } from 'mobx';

import TrezorConnect, { UI_EVENT, DEVICE_EVENT } from 'trezor-connect';
import type { DeviceMessage, UiMessage } from 'trezor-connect';

import Config from '../../config';
import environment from '../../environment';

import Store from '../base/Store';
import Wallet from '../../domain/Wallet';
import LocalizedRequest from '../lib/LocalizedRequest';

import globalMessages from '../../i18n/global-messages';
import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import { CheckAdressesInUseApiError } from '../../api/ada/errors';
import { derivePathPrefix } from '../../api/ada/lib/utils';

// This is actually just an interface
import {
  HWConnectStoreTypes,
  StepState,
  ProgressStep,
  ProgressInfo,
  HWDeviceInfo
} from '../../types/HWConnectStoreTypes';

import {
  Logger,
  stringifyError
} from '../../utils/logging';

import type {
  CreateHardwareWalletRequest,
  CreateHardwareWalletFunc,
} from '../../api/ada';

/** TODO: TrezorConnectStore and LedgerConnectStore has many common methods
  * try to make a common base class */
export default class TrezorConnectStore extends Store implements HWConnectStoreTypes {

  // =================== VIEW RELATED =================== //
  /** the only observable which manages state change */
  @observable progressInfo: ProgressInfo;

  /** only in ERROR state it will hold LocalizableError object */
  error: ?LocalizableError;

  get isActionProcessing(): boolean {
    return this.progressInfo.stepState === StepState.PROCESS;
  }

  // Trezor device label
  get defaultWalletName(): string {
    let defaultWalletName = '';
    if (this.hwDeviceInfo && this.hwDeviceInfo.hwFeatures) {
      defaultWalletName = this.hwDeviceInfo.hwFeatures.label;
    }
    return defaultWalletName;
  }

  /** device info which will be used to create wallet (except wallet name)
    * also it holds Trezor device label which is used as default wallet name
    * final wallet name will be fetched from the user */
  hwDeviceInfo: ?HWDeviceInfo;

  /** holds Trezor device DeviceMessage event object, device features will be fetched
    * from this object and will be converted to TrezorDeviceInfo object */
  trezorEventDevice: ?DeviceMessage;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createHWRequest: LocalizedRequest<CreateHardwareWalletFunc>
    = new LocalizedRequest<CreateHardwareWalletFunc>(this.api.ada.createHardwareWallet);

  /** While trezor wallet creation is taking place, we need to block users from starting a
    * trezor wallet creation on a seperate wallet and explain to them why the action is blocked */
  @observable isCreateHWActive: boolean = false;
  // =================== API RELATED =================== //

  setup() {
    this._reset();
    const trezorConnectAction = this.actions.ada.trezorConnect;
    trezorConnectAction.init.listen(this._init);
    trezorConnectAction.cancel.listen(this._cancel);
    trezorConnectAction.submitAbout.listen(this._submitAbout);
    trezorConnectAction.goBackToAbout.listen(this._goBackToAbout);
    trezorConnectAction.submitConnect.listen(this._submitConnect);
    trezorConnectAction.submitSave.listen(this._submitSave);

    try {
      /** Starting from v7 Trezor Connect Manifest has been made mandatory
        * https://github.com/trezor/connect/blob/develop/docs/index.md#trezor-connect-manifest */
      const trezorTConfig = Config.wallets.hardwareWallet.trezorT;
      TrezorConnect.manifest({
        email: trezorTConfig.manifest.EMAIL,
        appUrl: trezorTConfig.manifest.APP_URL
      });

      /** Preinitialization of TrezorConnect API will result in faster first response */
      // TODO [TREZOR]: sometimes when user does fast action initialization is still not complete
      // try to use same approach as ledger [for now moving this from _init() to setup()]
      TrezorConnect.init({});
    } catch (error) {
      Logger.error(`TrezorConnectStore::setup:error: ${stringifyError(error)}`);
    }
  }

  /** setup() is called when stores are being created
    * _init() is called when connect dailog is about to show */
  _init = (): void => {
    Logger.debug('TrezorConnectStore::_init called');
  }

  teardown(): void {
    if (!this.createHWRequest.isExecuting) {
      // Trezor Connect request should be reset only in case connect is finished/errored
      this.createHWRequest.reset();
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
    this.hwDeviceInfo = undefined;
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
    this._checkAndStoreHWDeviceInfo();
  };

  @action _goToConnectError = (): void => {
    this.progressInfo.currentStep = ProgressStep.CONNECT;
    this.progressInfo.stepState = StepState.ERROR;
  };

  _checkAndStoreHWDeviceInfo = async (): Promise<void> => {
    try {
      this.hwDeviceInfo = undefined;

      // TODO: [TREZOR] fix type if possible
      const trezorResp = await TrezorConnect.cardanoGetPublicKey({
        // TODO: only support Trezor wallest on account 0
        path: derivePathPrefix(0)
      });

      const trezorEventDevice: DeviceMessage = { ...this.trezorEventDevice };

      /** Converts a valid hardware wallet response to a common storable format
        * later the same format will be used to create wallet */
      this.hwDeviceInfo = this._normalizeHWResponse(trezorResp, trezorEventDevice);

      // It's a valid trezor device, go to Save Load state
      this._goToSaveLoad();

      /** TODO: [TREZOR] handle when user forcefully close Connect to Trezor Hardware Wallet
        * while connection in is progress */
      this._removeTrezorConnectEventListeners();
      Logger.info('Trezor device OK');
    } catch (error) {
      this._handleConnectError(error);
    }
  };

  _normalizeHWResponse = (
    trezorResp: any,
    trezorEventDevice: DeviceMessage
  ): HWDeviceInfo => {
    this._validateHWResponse(trezorResp, trezorEventDevice);

    /** This check aready done in _validateHWResponse but flow needs this */
    if (trezorEventDevice == null
      || trezorEventDevice.payload == null
      || trezorEventDevice.payload.features == null) {
      throw new Error('Trezor device hardware info not valid');
    }

    const deviceFeatures = trezorEventDevice.payload.features;
    return {
      publicMasterKey: trezorResp.payload.publicKey,
      hwFeatures: {
        vendor: deviceFeatures.vendor,
        model: deviceFeatures.model,
        deviceId: deviceFeatures.device_id,
        label: deviceFeatures.label,
        majorVersion: deviceFeatures.major_version,
        minorVersion: deviceFeatures.minor_version,
        patchVersion: deviceFeatures.patch_version,
        language: deviceFeatures.language,
      }
    };
  }

  /** Validates the compatibility of data which we have received from Trezor device */
  _validateHWResponse = (
    trezorResp: any,
    trezorEventDevice: DeviceMessage
  ): boolean => {

    if (trezorResp && !trezorResp.success) {
      switch (trezorResp.payload.error) {
        case 'Iframe timeout':
          throw new LocalizableError(globalMessages.trezorError101);
        case 'Permissions not granted':
          throw new LocalizableError(globalMessages.hwError101);
        case 'Cancelled':
        case 'Popup closed':
          throw new LocalizableError(globalMessages.trezorError103);
        default:
          throw new Error(trezorResp.payload.error);
      }
    }

    if (trezorResp == null
      || trezorResp.payload == null
      || trezorResp.payload.publicKey == null
      || trezorResp.payload.publicKey.length <= 0) {
      throw new Error('Invalid public key received from Trezor device');
    }

    if (trezorEventDevice == null
      || trezorEventDevice.payload == null
      || trezorEventDevice.payload.type !== 'acquired'
      || trezorEventDevice.payload.features == null) {
      throw new Error('Invalid trezor device event');
    }

    return true;
  };

  _handleConnectError = (error): void => {
    Logger.error(`TrezorConnectStore::_handleConnectError ${stringifyError(error)}`);

    this.hwDeviceInfo = undefined;

    if (error instanceof LocalizableError) {
      this.error = error;
    } else {
      this.error = new UnexpectedError();
    }

    this._goToConnectError();
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
      Logger.debug('TrezorConnectStore::_saveHW:: stated');
      this._setIsCreateHWActive(true);
      this.createHWRequest.reset();

      const reqParams = this._prepareCreateHWReqParams(walletName);
      this.createHWRequest.execute(reqParams);
      if (!this.createHWRequest.promise) throw new Error('should never happen');

      const trezorWallet = await this.createHWRequest.promise;

      await this._onSaveSucess(trezorWallet);
    } catch (error) {
      Logger.error(`TrezorConnectStore::_saveHW::error ${stringifyError(error)}`);

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
      throw new Error('Trezor device hardware info not valid');
    }

    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    return {
      walletName,
      publicMasterKey: this.hwDeviceInfo.publicMasterKey,
      hwFeatures: this.hwDeviceInfo.hwFeatures,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
    };
  }

  @action _goToSaveError = (): void => {
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.ERROR;
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

    this.teardown();
    Logger.info('SUCCESS: Trezor Connected Wallet created and loaded');
  };
  // =================== SAVE =================== //

  // =================== API =================== //
  @action _setIsCreateHWActive = (active: boolean): void => {
    this.isCreateHWActive = active;
  };
  // =================== API =================== //
}
