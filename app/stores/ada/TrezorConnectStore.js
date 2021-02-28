// @flow
// Handles Connect to Trezor Hardware Wallet dialog

import { observable, action, runInAction } from 'mobx';

import TrezorConnect from 'trezor-connect';
import type { DeviceEvent } from 'trezor-connect/lib/types/trezor/device';
import type { UiEvent } from 'trezor-connect/lib/types/events';
import type { CardanoPublicKey } from 'trezor-connect/lib/types/networks/cardano';
import type { Success, Unsuccessful, } from 'trezor-connect/lib/types/params';

import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';

import globalMessages from '../../i18n/global-messages';
import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import { CheckAddressesInUseApiError } from '../../api/common/errors';
import { getTrezorManifest, wrapWithFrame, wrapWithoutFrame } from '../lib/TrezorWrapper';
import { ROUTES } from '../../routes-config';
import Config from '../../config';

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
import {
  CoinTypes,
  HARD_DERIVATION_START,
  WalletTypePurpose,
} from '../../config/numbersConfig';
import {
  Bip44DerivationLevels,
} from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import type {
  RestoreModeType,
} from '../../actions/common/wallet-restore-actions';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

type TrezorConnectionResponse = {|
  trezorResp: Success<CardanoPublicKey> | Unsuccessful,
  trezorEventDevice: DeviceEvent,
|};


export default class TrezorConnectStore
  extends Store<StoresMap, ActionsMap>
  implements HWConnectStoreTypes<TrezorConnectionResponse> {

  // =================== VIEW RELATED =================== //
  /** the only observable which manages state change */
  @observable progressInfo: ProgressInfo;
  @observable derivationIndex: number = HARD_DERIVATION_START + 0; // assume single account
  @observable mode: void | RestoreModeType;

  /** only in ERROR state it will hold LocalizableError object */
  error: ?LocalizableError;

  get isActionProcessing(): boolean {
    return this.progressInfo.stepState === StepState.PROCESS;
  }

  // Trezor device label
  get defaultWalletName(): string {
    let defaultWalletName = '';
    if (this.hwDeviceInfo && this.hwDeviceInfo.hwFeatures) {
      defaultWalletName = this.hwDeviceInfo.defaultName;
    }
    return defaultWalletName;
  }

  /** device info which will be used to create wallet (except wallet name)
    * also it holds Trezor device label which is used as default wallet name
    * final wallet name will be fetched from the user */
  hwDeviceInfo: ?HWDeviceInfo;

  /** holds Trezor device DeviceMessage event object, device features will be fetched
    * from this object and will be converted to TrezorDeviceInfo object */
  trezorEventDevice: ?DeviceEvent;
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
    trezorConnectAction.setMode.listen((mode) => runInAction(() => { this.mode = mode; }));

    try {
      const trezorManifest = getTrezorManifest();
      wrapWithoutFrame(trezor => trezor.manifest(trezorManifest));
    } catch (error) {
      Logger.error(`${nameof(TrezorConnectStore)}::${nameof(this.setup)} error: ${stringifyError(error)}`);
    }
  }

  /** setup() is called when stores are being created
    * _init() is called when connect dialog is about to show */
  _init: void => void = () => {
    Logger.debug(`${nameof(TrezorConnectStore)}::${nameof(this._init)} called`);
  }

  teardown(): void {
    if (!this.createHWRequest.isExecuting) {
      // Trezor Connect request should be reset only in case connect is finished/errored
      this.createHWRequest.reset();
    }

    this._reset();
    super.teardown();
  }

  @action _reset: void => void = () => {
    this.mode = undefined;
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

      const trezorResp = await wrapWithFrame(
        trezor => trezor.cardanoGetPublicKey({
          path: this.getPath(),
          showOnTrezor: false
        }),
        this._onTrezorDeviceEvent,
        this._onTrezorUIEvent,
      );

      if (this.trezorEventDevice == null) {
        throw new Error(`${nameof(this._checkAndStoreHWDeviceInfo)} no ${nameof(this.trezorEventDevice)}`);
      }
      const trezorEventDevice = this.trezorEventDevice;

      /** Converts a valid hardware wallet response to a common storable format
        * later the same format will be used to create wallet */
      this.hwDeviceInfo = this._normalizeHWResponse({ trezorResp, trezorEventDevice });

      // It's a valid trezor device, go to Save Load state
      this._goToSaveLoad();

      /** TODO: [TREZOR] handle when user forcefully close Connect to Trezor Hardware Wallet
        * while connection in is progress */
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
      throw new Error(`${nameof(TrezorConnectStore)}::${nameof(this._normalizeHWResponse)} should never happen`);
    }

    const { trezorResp, trezorEventDevice } = resp;

    /** This check already done in _validateHWResponse but flow needs this */
    const device = trezorEventDevice.payload;
    const { features } = device;
    if (features == null) {
      throw new Error('Trezor device hardware info not valid');
    }

    return {
      publicMasterKey: trezorResp.payload.publicKey,
      hwFeatures: {
        Vendor: features.vendor ?? Config.wallets.hardwareWallet.trezorT.VENDOR,
        Model: features.model,
        DeviceId: features.device_id || '',
      },
      defaultName: device.label || '',
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

  _onTrezorDeviceEvent: DeviceEvent => void = (event) => {
    Logger.debug(`TrezorConnectStore:: DEVICE_EVENT: ${event.type}`);
    this.trezorEventDevice = event;
  };

  _onTrezorUIEvent: UiEvent => void = (event) => {
    Logger.debug(`TrezorConnectStore:: UI_EVENT: ${event.type}`);
    // TODO: [TREZOR] https://github.com/Emurgo/yoroi-frontend/issues/126
    // if(event.type === CLOSE_UI_WINDOW &&
    //   this.progressState === ProgressStateOption.CONNECT_START &&
    //   this.publicKeyInfo.valid === false) {
    //   this.progressState = ProgressStateOption.CONNECT_ERROR;
    //   this.publicKeyInfo.errorId = 'trezor forcefully stopped';
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
      );
      this.createHWRequest.execute(reqParams);
      if (!this.createHWRequest.promise) throw new Error('should never happen');

      const newWallet = await this.createHWRequest.promise;

      await this._onSaveSuccess(newWallet.publicDeriver);
    } catch (error) {
      Logger.error(`${nameof(TrezorConnectStore)}::${nameof(this._saveHW)}::error ${stringifyError(error)}`);

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

  _prepareCreateHWReqParams: string => CreateHardwareWalletRequest = (
    walletName,
  ) => {
    if (this.hwDeviceInfo == null
      || this.hwDeviceInfo.publicMasterKey == null
      || this.hwDeviceInfo.hwFeatures == null) {
      throw new Error('Trezor device hardware info not valid');
    }
    const { publicMasterKey, hwFeatures } = this.hwDeviceInfo;

    const persistentDb = this.stores.loading.loadPersistentDbRequest.result;
    if (persistentDb == null) {
      throw new Error(`${nameof(this._prepareCreateHWReqParams)} db not loaded. Should never happen`);
    }

    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this._prepareCreateHWReqParams)} no network selected`);

    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;

    return {
      db: persistentDb,
      addressing: {
        path: this.getPath(),
        startLevel: Bip44DerivationLevels.PURPOSE.level,
      },
      walletName,
      publicKey: publicMasterKey,
      hwFeatures,
      network: selectedNetwork,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
    };
  }

  getPath: void => Array<number> = () => {
    const suffix = [CoinTypes.CARDANO, this.derivationIndex];
    if (this.mode == null) {
      throw new Error(`${nameof(TrezorConnectStore)}::${nameof(this._prepareCreateHWReqParams)} missing mode`);
    }
    if (this.mode.type === 'bip44') {
      return [WalletTypePurpose.BIP44, ...suffix];
    }
    if (this.mode.type === 'cip1852') {
      return [WalletTypePurpose.CIP1852, ...suffix];
    }
    throw new Error(`${nameof(TrezorConnectStore)}::${nameof(this._prepareCreateHWReqParams)} unknown purpose`);
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
    this.actions.wallets.setActiveWallet.trigger({
      wallet: publicDeriver
    });
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });

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

  // this is used to inject test data
  setSelectedMockWallet: string => Promise<void> = async (serial) => {
    // $FlowExpectedError[prop-missing] only added in tests
    if (TrezorConnect.setSelectedWallet != null) { // eslint-disable-line no-restricted-properties
      // $FlowExpectedError[not-a-function] only added in tests
      await TrezorConnect.setSelectedWallet(serial); // eslint-disable-line no-restricted-properties
    }
  }
  // =================== API =================== //
}
