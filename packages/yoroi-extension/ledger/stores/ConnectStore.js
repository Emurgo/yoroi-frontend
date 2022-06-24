// @flow //
import { observable, action, runInAction, computed } from 'mobx';
import AdaApp, {
  TxAuxiliaryDataType
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type {
  GetVersionResponse,
  GetSerialResponse,
  DeriveAddressResponse,
  GetExtendedPublicKeyResponse,
  GetExtendedPublicKeysResponse,
  SignTransactionResponse,
  SignTransactionRequest,
  DeriveAddressRequest,
  GetExtendedPublicKeyRequest,
  GetExtendedPublicKeysRequest,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type {
  MessageType,
  RequestType,
  ShowAddressRequestWrapper,
} from '../types/cmn';
import type {
  DeviceCodeType,
  ProgressStateType,
  OperationNameType,
  TransportIdType,
} from '../types/enum';
import {
  PROGRESS_STATE,
  OPERATION_NAME,
  DEVICE_CODE,
} from '../types/enum';
import {
  YOROI_LEDGER_CONNECT_TARGET_NAME,
  DEVICE_LOCK_CHECK_TIMEOUT_MS,
  ENV,
  SUPPORTED_VERSION,
} from '../const';
import {
  ledgerErrToMessage,
  makeTransport,
  convertStringToDeviceCodeType,
  formatError,
} from '../utils/cmn';
import {
  setKnownDeviceCode,
  getKnownDeviceCode,
} from '../utils/storage';
import semverSatisfies from 'semver/functions/satisfies';

export default class ConnectStore {
  @observable transportId: TransportIdType;
  @observable progressState: ProgressStateType;
  @observable currentOperationName: OperationNameType;
  @observable signTxInfo: SignTransactionRequest;
  @observable verifyAddressInfo: ShowAddressRequestWrapper;
  @observable deriveAddressInfo: DeriveAddressRequest;
  @observable deviceCode: DeviceCodeType
  @observable wasDeviceLocked: boolean;
  @observable deviceVersion: string;
  @observable response: void | MessageType;
  @observable expectedSerial: ?string;
  @observable extension: ?string;
  userInteractableRequest: RequestType;

  constructor(transportId: TransportIdType) {
    window.addEventListener('message', this._onMessage);

    runInAction(() => {
      this.wasDeviceLocked = false;
      this.transportId = transportId;
      this.progressState = PROGRESS_STATE.LOADING;
      this.deviceCode = convertStringToDeviceCodeType(getKnownDeviceCode());
    });
  }

  @computed
  get isTransportWebAuthn(): boolean {
    return this.transportId === 'webauthn';
  }

  @computed
  get isTransportU2F(): boolean {
    return this.transportId === 'u2f';
  }

  @computed
  get isTransportWebUSB(): boolean {
    return this.transportId === 'webusb';
  }

  @action('Changing Transport')
  setTransport = (transportId: TransportIdType): void => {
    this.transportId = transportId;
  }

  @action('Changing Progress State')
  setProgressState = (progressState: ProgressStateType): void => {
    this.progressState = progressState;
  }

  @action('Changing Current Operation Name')
  setCurrentOperationName = (currentOperationName: OperationNameType): void => {
    this.currentOperationName = currentOperationName;
  }

  @action('Changing device name')
  setDeviceCode = (deviceCode: DeviceCodeType): void => {
    this.deviceCode = deviceCode;
  }

  @action('Change Sign Tx Info')
  setSignTxInfo = (signTxInfo: SignTransactionRequest): void => {
    this.signTxInfo = signTxInfo;
  }

  @action('Change Verify Address Info')
  setVerifyAddressInfo = (verifyAddressInfo: ShowAddressRequestWrapper): void => {
    this.verifyAddressInfo = verifyAddressInfo;
  }

  @action('Change Derive Address Info')
  setDeriveAddressInfo = (deriveAddressInfo: DeriveAddressRequest): void => {
    this.deriveAddressInfo = deriveAddressInfo;
  }

  @action('Set response')
  setResponse = (response: MessageType): void => {
    this.response = response;
  }

  _detectLedgerDevice = async (transport: any): Promise<{|
    version: GetVersionResponse,
    serial: GetSerialResponse,
  |}> => {

    setTimeout(() => {
      // Device is not detected till now so we assume that it's locked
      if (this.progressState === PROGRESS_STATE.DEVICE_TYPE_SELECTED) {
        runInAction(() => {
          this.wasDeviceLocked = true;
          this.setProgressState(PROGRESS_STATE.DETECTING_DEVICE);
        });
      }
    }, DEVICE_LOCK_CHECK_TIMEOUT_MS);

    const adaApp = new AdaApp(transport);
    const versionResp = await adaApp.getVersion();
    const currentSerial = await adaApp.getSerial();
    if (this.expectedSerial != null) {
      if (currentSerial.serialHex !== this.expectedSerial) {
        throw new Error(`Incorrect hardware wallet. This wallet was created with a device with serial ID ${this.expectedSerial ?? 'undefined'}, but you are currently using ${currentSerial.serialHex}.`);
      }
    }

    const semverResp = `${versionResp.version.major}.${versionResp.version.minor}.${versionResp.version.patch}`;
    if (!semverSatisfies(semverResp, SUPPORTED_VERSION)) {
      throw new Error(`Incorrect Cardano app version. Supports version ${SUPPORTED_VERSION} but you have version ${semverResp}`);
    }
    runInAction(() => {
      this.deviceVersion = semverResp;
    });
    this.setProgressState(PROGRESS_STATE.DEVICE_FOUND);

    return {
      version: versionResp,
      serial: currentSerial,
    };
  }

  executeActionWithCustomRequest = (
    deviceCode: DeviceCodeType,
    request: RequestType
  ) => {
    this.userInteractableRequest = request;
    this.executeAction(deviceCode);
  }

  executeAction = (deviceCode: DeviceCodeType) => {
    runInAction(() => {
      setKnownDeviceCode(deviceCode);
      this.setDeviceCode(deviceCode);
      this.setProgressState(PROGRESS_STATE.DEVICE_TYPE_SELECTED);
    });

    const actn = this.userInteractableRequest.action;
    const { params } = this.userInteractableRequest;

    switch (actn) {
      case OPERATION_NAME.GET_LEDGER_VERSION:
        this.getVersion(actn);
        break;
      case OPERATION_NAME.GET_SERIAL:
        this.getSerial(actn);
        break;
      case OPERATION_NAME.GET_EXTENDED_PUBLIC_KEY:
        this.getExtendedPublicKey({
          actn,
          params
        });
        break;
      case OPERATION_NAME.GET_EXTENDED_PUBLIC_KEYS:
        this.getExtendedPublicKeys({
          actn,
          params
        });
        break;
      case OPERATION_NAME.SIGN_TX:
        this.signTransaction({
          actn,
          params,
        });
        break;
      case OPERATION_NAME.SHOW_ADDRESS:
        this.showAddress({
          actn,
          params,
        });
        break;
      case OPERATION_NAME.DERIVE_ADDRESS:
        this.deriveAddress({
          actn,
          params,
        });
        break;
      default:
        throw new Error(`[YLC] Unexpected action called: ${actn}`);
    }
  }

  // #==============================================#
  //  Cardano Ledger APIs
  // #==============================================#

  getExtendedPublicKey: {|
    actn: OperationNameType,
    params: GetExtendedPublicKeyRequest,
  |} => Promise<void> = async (request) => {
    let transport;
    try {
      transport = await makeTransport(this.transportId);
      const deviceInfo = await this._detectLedgerDevice(transport);

      const adaApp = new AdaApp(transport);
      const ePublicKeyResp: GetExtendedPublicKeyResponse =
        await adaApp.getExtendedPublicKey(request.params);

      const resp = {
        response: ePublicKeyResp,
        deviceVersion: deviceInfo.version,
        deriveSerial: deviceInfo.serial,
      };
      this._replyMessageWrap(request.actn, true, resp);
    } catch (err) {
      this._replyError(request.actn, err);
    } finally {
      transport && transport.close();
    }
  };

  getExtendedPublicKeys: {|
    actn: OperationNameType,
    params: GetExtendedPublicKeysRequest,
  |} => Promise<void> = async (request) => {
    let transport;
    try {
      transport = await makeTransport(this.transportId);
      const deviceInfo = await this._detectLedgerDevice(transport);

      const adaApp = new AdaApp(transport);
      const ePublicKeyResp: GetExtendedPublicKeysResponse =
        await adaApp.getExtendedPublicKeys(request.params);

      const resp = {
        response: ePublicKeyResp,
        deviceVersion: deviceInfo.version,
        deriveSerial: deviceInfo.serial,
      };
      this._replyMessageWrap(request.actn, true, resp);
    } catch (err) {
      this._replyError(request.actn, err);
    } finally {
      transport && transport.close();
    }
  };

  signTransaction: {|
    actn: OperationNameType,
    params: SignTransactionRequest,
  |} => Promise<void> = async (request) => {
    let transport;
    try {
      this.setSignTxInfo(request.params);

      transport = await makeTransport(this.transportId);
      const { version } = await this._detectLedgerDevice(transport);

      if (
        (request.params.tx.auxiliaryData?.type ===
          TxAuxiliaryDataType.CATALYST_REGISTRATION) &&
        !version.compatibility.supportsCatalystRegistration
      ) {
        this._replyMessageWrap(
          request.actn,
          false,
          { error: 'catalyst registration not supported' }
        );
        return;
      }

      const adaApp = new AdaApp(transport);
      const resp: SignTransactionResponse = await adaApp.signTransaction(
        request.params
      );

      this._replyMessageWrap(request.actn, true, resp);
    } catch (err) {
      this._replyError(request.actn, err);
    } finally {
      transport && transport.close();
    }
  };

  showAddress: {|
    actn: OperationNameType,
    params: ShowAddressRequestWrapper,
  |} => Promise<void> = async (request) => {
    let transport;
    try {
      this.setVerifyAddressInfo(request.params);

      transport = await makeTransport(this.transportId);
      await this._detectLedgerDevice(transport);

      const adaApp = new AdaApp(transport);
      const resp = await adaApp.showAddress({
        address: request.params.address,
        network: request.params.network,
      });

      this._replyMessageWrap(request.actn, true, resp);
    } catch (err) {
      this._replyError(request.actn, err);
    } finally {
      transport && transport.close();
    }
  };

  deriveAddress: {|
    actn: OperationNameType,
    params: DeriveAddressRequest,
  |} => Promise<void> = async (request) => {
    let transport;
    try {
      this.setDeriveAddressInfo(request.params);

      transport = await makeTransport(this.transportId);
      await this._detectLedgerDevice(transport);

      const adaApp = new AdaApp(transport);
      const resp: DeriveAddressResponse = await adaApp.deriveAddress(
        request.params
      );

      this._replyMessageWrap(request.actn, true, resp);
    } catch (err) {
      this._replyError(request.actn, err);
    } finally {
      transport && transport.close();
    }
  };

  getVersion = async (actn: OperationNameType): Promise<void> => {
    let transport;
    try {
      transport = await makeTransport(this.transportId);

      const adaApp = new AdaApp(transport);
      const resp: GetVersionResponse = await adaApp.getVersion();

      this._replyMessageWrap(actn, true, resp);
    } catch (err) {
      this._replyError(actn, err);
    } finally {
      transport && transport.close();
    }
  };

  getSerial = async (actn: OperationNameType): Promise<void> => {
    let transport;
    try {
      transport = await makeTransport(this.transportId);

      const adaApp = new AdaApp(transport);
      const resp: GetSerialResponse = await adaApp.getSerial();

      this._replyMessageWrap(actn, true, resp);
    } catch (err) {
      this._replyError(actn, err);
    } finally {
      transport && transport.close();
    }
  };

  // #==============================================#
  //  Website <==> Content Script communications
  // #==============================================#

  /**
   * Handle message from Content Script [ Website <== Content Script ]
   * @param {*} req request message object
   */
  _onMessage = (req: {
    origin?: string,
    data?: ?{
      serial?: ?string,
      params?: any,
      target?: string,
      action?: OperationNameType,
      extension?: ?string,
      ...,
    },
    ...
  }): void => {
    const { data } = req;
    if (data == null) {
      console.error(`Missing data in req ${JSON.stringify(req)}`);
      return;
    }
    if (!data.target?.startsWith(YOROI_LEDGER_CONNECT_TARGET_NAME)) {
      console.debug(`[YLC] Got non ledger ConnectStore\nrequest: ${req.origin ?? 'undefined'}\ndata: ${JSON.stringify(req.data, null, 2) ?? 'undefined'}`);
      return;
    }
    if (data.extension != null) {
      runInAction(() => { this.extension = data.extension; });
    }
    if (data.serial != null) {
      runInAction(() => { this.expectedSerial = data.serial; });
    }
    if (data.action == null) {
      console.error(`Missing action in req ${JSON.stringify(req)}`);
      return;
    }

    const { params } = data;
    const actn = data.action;

    console.debug(`[YLC] request: ${actn}`);

    switch (actn) {
      case OPERATION_NAME.GET_LEDGER_VERSION:
      case OPERATION_NAME.GET_SERIAL:
      case OPERATION_NAME.GET_EXTENDED_PUBLIC_KEY:
      case OPERATION_NAME.GET_EXTENDED_PUBLIC_KEYS:
      case OPERATION_NAME.SIGN_TX:
      case OPERATION_NAME.SHOW_ADDRESS:
      case OPERATION_NAME.DERIVE_ADDRESS:
        // Only one operation in one session
        if (!this.userInteractableRequest) {
          this.userInteractableRequest = {
            params,
            action: actn,
          };

          runInAction(() => {
            // In case of create wallet, we always
            // want user to choose device
            if (actn === OPERATION_NAME.GET_EXTENDED_PUBLIC_KEY) {
              this.setDeviceCode(DEVICE_CODE.NONE);
              setKnownDeviceCode(DEVICE_CODE.NONE);
            }
            if (actn === OPERATION_NAME.GET_EXTENDED_PUBLIC_KEYS) {
              this.setDeviceCode(DEVICE_CODE.NONE);
              setKnownDeviceCode(DEVICE_CODE.NONE);
            }
            this.setCurrentOperationName(actn);
            this.setProgressState(PROGRESS_STATE.DEVICE_TYPE_SELECTION);
          });
        }
        break;
      case OPERATION_NAME.CLOSE_WINDOW:
        window.close();
        break;
      default:
        console.error(`[YLC] Unexpected action requested: ${actn}`);
        break;
    }
  }

  /**
   * Wrapper for _replyMessage()
   * @param {*} actn action string
   * @param {*} success success status boolean
   * @param {*} payload payload object
   */
  _replyMessageWrap = (actn: string, success: boolean, payload: any): void => {
    this._replyMessage({
      success,
      payload,
      action: actn,
      extension: this.extension,
    });
  }

  /**
   * Wrapper for _replyMessage() for sending error
   * @param {*} actn action string
   * @param {*} err Error object
   */
  _replyError = (actn: string, err: Error): void => {
    console.error(`[YLC] ${actn}${formatError(err)}`);
    const payload = {
      error: ledgerErrToMessage(err).toString()
    };
    this._replyMessageWrap(actn, false, payload);
  }

  /**
   * Reply message to Content Script  [ Website ==> Content Script ]
   * @param {*} msg MessageType object as reply
   */
  _replyMessage = (msg: MessageType): void => {
    if (ENV.isDevelopment) {
      this.setResponse(msg);
      this.setProgressState(PROGRESS_STATE.DEVICE_RESPONSE);
    }
    msg.action = `${msg.action}-reply`;
    window.postMessage(msg, '*');
  }
}
