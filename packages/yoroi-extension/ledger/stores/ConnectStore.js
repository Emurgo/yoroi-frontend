// @flow //
declare var chrome;

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
  MessageData,
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
  userInteractableRequest: ?RequestType;
  sendResponseFunc: ?(any) => void;

  constructor(transportId: TransportIdType) {
    // message from the test panel
    window.addEventListener('message', this._onMessage);
    // message from Yoroi extension main tab
    chrome.runtime.onMessage.addListener(this._onMessage);

    runInAction(() => {
      this.wasDeviceLocked = false;
      this.transportId = transportId;
      this.progressState = PROGRESS_STATE.LOADING;
      this.deviceCode = convertStringToDeviceCodeType(getKnownDeviceCode());
    });

    const params = new URLSearchParams(document.location.search);
    const mainTabId = Number(params.get('mainTabId'));
    chrome.tabs.getCurrent(tab => {
      chrome.tabs.sendMessage(mainTabId, { type: 'ledger-ready', tabId: tab.id });
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
  setTransport: (TransportIdType) => void = (transportId) => {
    this.transportId = transportId;
  }

  @action('Changing Progress State')
  setProgressState: (ProgressStateType) => void = (progressState) => {
    this.progressState = progressState;
  }

  @action('Changing Current Operation Name')
  setCurrentOperationName: (OperationNameType) => void = (currentOperationName) => {
    this.currentOperationName = currentOperationName;
  }

  @action('Changing device name')
  setDeviceCode: (DeviceCodeType) => void = (deviceCode) => {
    this.deviceCode = deviceCode;
  }

  @action('Change Sign Tx Info')
  setSignTxInfo: (SignTransactionRequest) => void = (signTxInfo) => {
    this.signTxInfo = signTxInfo;
  }

  @action('Change Verify Address Info')
  setVerifyAddressInfo: (ShowAddressRequestWrapper) => void = (verifyAddressInfo) => {
    this.verifyAddressInfo = verifyAddressInfo;
  }

  @action('Change Derive Address Info')
  setDeriveAddressInfo: (DeriveAddressRequest) => void = (deriveAddressInfo) => {
    this.deriveAddressInfo = deriveAddressInfo;
  }

  @action('Set response')
  setResponse: (MessageType) => void = (response) => {
    this.response = response;
  }

  _detectLedgerDevice: (any) => Promise<{|
    version: GetVersionResponse,
    serial: GetSerialResponse,
  |}> = async (transport) => {

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

  executeActionWithCustomRequest: (DeviceCodeType, RequestType) => void = (
    deviceCode, request
  ) => {
    this.userInteractableRequest = request;
    this.executeAction(deviceCode);
  }

  executeAction: (DeviceCodeType) => void = (deviceCode) => {
    runInAction(() => {
      setKnownDeviceCode(deviceCode);
      this.setDeviceCode(deviceCode);
      this.setProgressState(PROGRESS_STATE.DEVICE_TYPE_SELECTED);
    });

    if (!this.userInteractableRequest) {
      return;
    }
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
      case OPERATION_NAME.SIGN_MESSAGE:
        this.signMessage({
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
          TxAuxiliaryDataType.CIP36_REGISTRATION) &&
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

  getVersion: (OperationNameType) => Promise<void> = async (actn) => {
    let transport;
    try {
      transport = await makeTransport(this.transportId);

      const adaApp = new AdaApp(transport);
      const resp: GetVersionResponse = await adaApp.getVersion();

      this._replyMessageWrap(actn, true, resp, true);
    } catch (err) {
      this._replyError(actn, err);
    } finally {
      transport && transport.close();
    }
  };

  getSerial: (OperationNameType) => Promise<void> = async (actn)=> {
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

  signMessage: {|
    actn: OperationNameType,
    params: MessageData,
  |} => Promise<void> = async (request) => {
    let transport;
    try {
      transport = await makeTransport(this.transportId);
      const { version } = await this._detectLedgerDevice(transport);

      const adaApp = new AdaApp(transport);
      const resp = await adaApp.signMessage(
        request.params
      );

      this._replyMessageWrap(request.actn, true, resp);
    } catch (err) {
      this._replyError(request.actn, err);
    } finally {
      transport && transport.close();
    }
  };

  // #==============================================#
  //  Yoroi extension main tab <==> this tab communications
  // #==============================================#

  /**
   * Handle message from Content Script [ Website <== Content Script ]
   * @param {*} req request message object
   */
  _onMessage: (
    req: {
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
    },
    // present if the message is sent from Yoroi extension main tab
    _sender?: any,
    sendResponse?: ?(any) => void,
  ) => ?boolean = (req, _sender, sendResponse) => {
    if (sendResponse) {
      this.sendResponseFunc = sendResponse;
    }
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
      case OPERATION_NAME.SIGN_MESSAGE:
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
    // this lets Chrome keeps the port open so that we can send the reponse
    return true;
  }

  /**
   * Wrapper for _replyMessage()
   * @param {*} actn action string
   * @param {*} success success status boolean
   * @param {*} payload payload object
   */
  _replyMessageWrap: (string, boolean, any, ?boolean) => void = (
    actn, success, payload, dontClose,
  ) => {
    this._replyMessage(
      {
        success,
        payload,
        action: actn,
        extension: this.extension,
      },
      dontClose,
    );
  }

  /**
   * Wrapper for _replyMessage() for sending error
   * @param {*} actn action string
   * @param {*} err Error object
   */
  _replyError: (string, Error) => void = (actn, err) => {
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
  _replyMessage: (MessageType, ?boolean) => void = (msg, dontClose) => {
    if (dontClose) {
      runInAction(() => {
        this.userInteractableRequest = null;
        this.setProgressState(PROGRESS_STATE.DEVICE_TYPE_SELECTED);
      });
    } else {
      if (ENV.isDevelopment) {
        this.setResponse(msg);
        this.setProgressState(PROGRESS_STATE.DEVICE_RESPONSE);
      } else {
        window.close();
      }
    }
    msg.action = `${msg.action}-reply`;
    if (this.sendResponseFunc != null) {
      this.sendResponseFunc(msg);
    } else {
      window.postMessage(msg, '*');
    }
  }
}
