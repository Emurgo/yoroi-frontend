// @flow
// Handles Connect to Trezor Hardware Wallet dialog

import { observable, action } from 'mobx';

import TrezorConnect, { UI_EVENT, DEVICE_EVENT } from 'trezor-connect';
import type { DeviceMessage, UiMessage } from 'trezor-connect';
import type { CardanoGetPublicKey$ } from 'trezor-connect/lib/types/cardano';

import Config from '../../config';
import environment from '../../environment';

import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';

import globalMessages from '../../i18n/global-messages';
import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import { CheckAdressesInUseApiError } from '../../api/ada/errors';
import { derivePathPrefix } from '../../api/ada/transactions/utils';

// This is actually just an interface
import {
  HWConnectStoreTypes,
  ProgressStep,
  ProgressInfo,
  HWDeviceInfo
} from '../../types/HWConnectStoreTypes';
import { StepState } from '../../components/widgets/ProgressSteps';

import {
  Logger,
  stringifyError
} from '../../utils/logging';

import type {
  CreateHardwareWalletRequest,
  CreateHardwareWalletFunc,
} from '../../api/ada';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import { HARD_DERIVATION_START } from '../../config/numbersConfig';

type TrezorConnectionResponse = {|
  trezorResp: CardanoGetPublicKey$,
  trezorEventDevice: DeviceMessage,
|};

export default class TrezorConnectStore
  extends Store
  implements HWConnectStoreTypes<TrezorConnectionResponse> {

  // =================== VIEW RELATED =================== //
  /** the only observable which manages state change */
  @observable progressInfo: ProgressInfo;
  @observable derivationIndex: number = 0; // assume single account

  /** only in ERROR state it will hold LocalizableError object */
  error: ?LocalizableError;

  get isActionProcessing(): boolean {
    return this.progressInfo.stepState === StepState.PROCESS;
  }

  // Trezor device label
  get defaultWalletName(): string {
    let defaultWalletName = '';
    if (this.hwDeviceInfo && this.hwDeviceInfo.hwFeatures) {
      defaultWalletName = this.hwDeviceInfo.hwFeatures.Label;
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

  setup(): void {
    super.setup();
    this._reset();
    const trezorConnectAction = this.actions.ada.trezorConnect;
    trezorConnectAction.init.listen(this._init);
    trezorConnectAction.cancel.listen(this._cancel);
    trezorConnectAction.submitCheck.listen(this._submitCheck);
    trezorConnectAction.goBackToCheck.listen(this._goBackToCheck);
    trezorConnectAction.submitConnect.listen(this._submitConnect);
    trezorConnectAction.submitSave.listen(this._submitSave);

    try {
      /** Starting from v7 Trezor Connect Manifest has been made mandatory
        * https://github.com/trezor/connect/blob/develop/docs/index.md#trezor-connect-manifest */
      const { manifest } = Config.wallets.hardwareWallet.trezorT;

      const trezorManifest = {};
      trezorManifest.email = manifest.EMAIL;
      if (environment.userAgentInfo.isFirefox) {
        // Set appUrl for `moz-extension:` protocol using browser (like Firefox)
        trezorManifest.appUrl = manifest.appURL.FIREFOX;
      } else {
        // For all other browser supported that uses `chrome-extension:` protocol
        // In future if other non chrome like browser is supported them we can consider updating
        trezorManifest.appUrl = manifest.appURL.CHROME;
      }
      TrezorConnect.manifest(trezorManifest);

      /** Preinitialization of TrezorConnect API will result in faster first response */
      // we purposely don't want to await. Safe in practice.
      TrezorConnect.init({});
    } catch (error) {
      Logger.error(`TrezorConnectStore::setup:error: ${stringifyError(error)}`);
    }
  }

  /** setup() is called when stores are being created
    * _init() is called when connect dailog is about to show */
  _init: void => void = () => {
    Logger.debug(`${nameof(TrezorConnectStore)}::${nameof(this._init)} called`);
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

  @action _reset: void => void = () => {
    this.progressInfo = {
      currentStep: ProgressStep.CHECK,
      stepState: StepState.LOAD,
    };
    this.error = undefined;
    this.hwDeviceInfo = undefined;
    this.trezorEventDevice = undefined;
  };

  @action _cancel: void => void = () => {
    this.teardown();
  };

  // =================== CHECK =================== //
  /** CHECK dialog submit(Next button) */
  @action _submitCheck: void => void = () => {
    this.error = undefined;
    this.trezorEventDevice = undefined;
    this._removeTrezorConnectEventListeners();
    this._addTrezorConnectEventListeners();
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

  @action _goToConnectError: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.CONNECT;
    this.progressInfo.stepState = StepState.ERROR;
  };

  _checkAndStoreHWDeviceInfo: void => Promise<void> = async () => {
    try {
      this.hwDeviceInfo = undefined;

      const trezorResp = await TrezorConnect.cardanoGetPublicKey({
        path: derivePathPrefix(this.derivationIndex)
      });

      const trezorEventDevice: DeviceMessage = { ...this.trezorEventDevice };

      /** Converts a valid hardware wallet response to a common storable format
        * later the same format will be used to create wallet */
      this.hwDeviceInfo = this._normalizeHWResponse({ trezorResp, trezorEventDevice });

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

  _normalizeHWResponse: (TrezorConnectionResponse) => HWDeviceInfo = (
    resp,
  ) => {
    this._validateHWResponse(resp);
    if (!resp.trezorResp.success) {
      throw new Error('TrezorConnectStore::_normalizeHWResponse should never happen');
    }

    const { trezorResp, trezorEventDevice } = resp;

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
        Vendor: deviceFeatures.vendor,
        Model: deviceFeatures.model,
        DeviceId: deviceFeatures.device_id,
        Label: deviceFeatures.label,
        MajorVersion: deviceFeatures.major_version,
        MinorVersion: deviceFeatures.minor_version,
        PatchVersion: deviceFeatures.patch_version,
        Language: deviceFeatures.language,
      }
    };
  }

  /** Validates the compatibility of data which we have received from Trezor device */
  _validateHWResponse: TrezorConnectionResponse => boolean = (
    resp,
  ) => {
    const { trezorResp, trezorEventDevice } = resp;

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

  _handleConnectError: Error => void = (error) => {
    Logger.error(`${nameof(TrezorConnectStore)}::${nameof(this._handleConnectError)} ${stringifyError(error)}`);

    this.hwDeviceInfo = undefined;

    if (error instanceof LocalizableError) {
      this.error = error;
    } else {
      this.error = new UnexpectedError();
    }

    this._goToConnectError();
  };

  _addTrezorConnectEventListeners: void => void = () => {
    if (TrezorConnect) {
      TrezorConnect.on(DEVICE_EVENT, this._onTrezorDeviceEvent);
      TrezorConnect.on(UI_EVENT, this._onTrezorUIEvent);
    } else {
      Logger.error(`${nameof(TrezorConnectStore)}::${nameof(this._addTrezorConnectEventListeners)}:: TrezorConnect not installed`);
    }
  };

  _removeTrezorConnectEventListeners: void => void = () => {
    if (TrezorConnect) {
      TrezorConnect.off(DEVICE_EVENT, this._onTrezorDeviceEvent);
      TrezorConnect.off(UI_EVENT, this._onTrezorUIEvent);
    }
  };

  _onTrezorDeviceEvent: DeviceMessage => void = (event) => {
    Logger.debug(`TrezorConnectStore:: DEVICE_EVENT: ${event.type}`);
    this.trezorEventDevice = event;
  };

  _onTrezorUIEvent: UiMessage => void = (event) => {
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
  @action _goToSaveLoad: void => void = () => {
    this.error = null;
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.LOAD;
  };

  /** SAVE dialog submit (Save button) */
  @action _submitSave: string => Promise<void> = async (
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
  _saveHW: string => Promise<void> = async (
    walletName,
  )  => {
    try {
      Logger.debug(`${nameof(TrezorConnectStore)}::${nameof(this._saveHW)}:: stated`);
      this._setIsCreateHWActive(true);
      this.createHWRequest.reset();

      const reqParams = this._prepareCreateHWReqParams(
        walletName,
        this.derivationIndex + HARD_DERIVATION_START,
      );
      this.createHWRequest.execute(reqParams);
      if (!this.createHWRequest.promise) throw new Error('should never happen');

      const newWallet = await this.createHWRequest.promise;

      await this._onSaveSuccess(newWallet.publicDeriver);
    } catch (error) {
      Logger.error(`${nameof(TrezorConnectStore)}::${nameof(this._saveHW)}::error ${stringifyError(error)}`);

      // Refer: https://github.com/Emurgo/yoroi-frontend/pull/1055
      if (error instanceof CheckAdressesInUseApiError) {
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
      throw new Error('Trezor device hardware info not valid');
    }

    const persistentDb = this.stores.loading.loadPersitentDbRequest.result;
    if (persistentDb == null) {
      throw new Error(`${nameof(this._prepareCreateHWReqParams)} db not loaded. Should never happen`);
    }

    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    return {
      db: persistentDb,
      derivationIndex,
      walletName,
      publicKey: this.hwDeviceInfo.publicMasterKey,
      hwFeatures: this.hwDeviceInfo.hwFeatures,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
    };
  }

  @action _goToSaveError: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.SAVE;
    this.progressInfo.stepState = StepState.ERROR;
  };

  _onSaveSuccess: (PublicDeriver<>) => Promise<void> = async (publicDeriver) => {
    // close the active dialog
    Logger.debug(`${nameof(TrezorConnectStore)}::${nameof(this._onSaveSuccess)} success, closing dialog`);
    this.actions.dialogs.closeActiveDialog.trigger();

    const { wallets } = this.stores;
    await wallets.addHwWallet(publicDeriver);

    // show success notification
    wallets.showTrezorTWalletIntegratedNotification();

    this.teardown();
    Logger.info('SUCCESS: Trezor Connected Wallet created and loaded');
  };
  // =================== SAVE =================== //

  // =================== API =================== //
  @action _setIsCreateHWActive: boolean => void = (active) => {
    this.isCreateHWActive = active;
  };
  // =================== API =================== //
}
