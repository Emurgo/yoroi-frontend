// @flow
import { YOROI_LEDGER_CONNECT_TARGET_NAME } from '../../ledger/const';
import { OPERATION_NAME } from '../../ledger/types/enum';
import type {
  GetExtendedPublicKeyRequest,
  GetExtendedPublicKeysRequest,
  GetExtendedPublicKeyResponse,
  GetExtendedPublicKeysResponse,
  SignTransactionRequest,
  SignTransactionResponse,
  ShowAddressRequest,
  GetVersionResponse,
  GetSerialResponse,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type { MessageType } from '../../ledger/types/cmn';

declare var chrome;

export type ExtendedPublicKeyResp<Response> = {|
  response: Response,
  deviceVersion: GetVersionResponse,
  deriveSerial: GetSerialResponse,
|};

type ShowAddressRequestWrapper = {|
  ...ShowAddressRequest,
  expectedAddr: string,
|};

export class LedgerConnect {
  locale: string;
  tabId: ?number;

  constructor(params: {| locale: string |}) {
    this.locale = params.locale;
  }

  getExtendedPublicKey: {|
    serial: ?string,
    params: GetExtendedPublicKeyRequest,
  |} => Promise<ExtendedPublicKeyResp<GetExtendedPublicKeyResponse>> = (request) => {
    return this._requestLedger(
      OPERATION_NAME.GET_EXTENDED_PUBLIC_KEY,
      request.params,
      request.serial,
    );
  }

  getExtendedPublicKeys: {|
    serial: ?string,
    params: GetExtendedPublicKeysRequest,
  |} => Promise<ExtendedPublicKeyResp<GetExtendedPublicKeysResponse>> = (request) => {
    return this._requestLedger(
      OPERATION_NAME.GET_EXTENDED_PUBLIC_KEYS,
      request.params,
      request.serial,
    );
  }

  signTransaction: {|
    serial: ?string,
    params: SignTransactionRequest,
    useOpenTab?: boolean,
  |} => Promise<SignTransactionResponse> = (request) => {
    return this._requestLedger(
      OPERATION_NAME.SIGN_TX,
      request.params,
      request.serial,
      false,
      request.useOpenTab === true,
    );
  }

  showAddress: {|
    serial: ?string,
    params: ShowAddressRequestWrapper,
  |} => Promise<void> = (request) => {
    return this._requestLedger(
      OPERATION_NAME.SHOW_ADDRESS,
      request.params,
      request.serial,
    );
  }

  getVersion: {|
    serial: ?string,
    dontCloseTab?: boolean,
  |} => Promise<GetVersionResponse> = (request) => {
    return this._requestLedger(
      OPERATION_NAME.GET_LEDGER_VERSION,
      undefined,
      request.serial,
      true,
    );
  }

  async _requestLedger(
    action: string,
    params: any,
    serial: ?string,
    dontCloseTab?: boolean = false,
    useOpenTab?: boolean = false,
  ): any {
    let tabId;
    if (useOpenTab && this.tabId != null) {
      tabId = this.tabId;
    } else {
      tabId = await this._createLedgerTab();
      if (dontCloseTab) {
        this.tabId = tabId;
      }
    }

    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tabId,
        {
          data: JSON.parse(JSON.stringify({
            action,
            params,
            target: YOROI_LEDGER_CONNECT_TARGET_NAME,
            serial,
          })),
        },
        (response: ?MessageType) => {
          if (response != null) {
            if (response.payload?.error) {
              reject(new Error(response.payload.error));
            } else {
              resolve(response.payload);
            }
          } else {
            reject(new Error('Forcefully cancelled by user'));
          }
        },
      );
    });
  }

  _createLedgerTab(): Promise<number> {
    return new Promise(resolve => {
      const readyListener = (message, sender) => {
        if (message === 'ledger-ready') {
          chrome.runtime.onMessage.removeListener(readyListener);
          resolve(sender.tab.id);
        }
      };
      chrome.runtime.onMessage.addListener(readyListener);
      chrome.tabs.create({ url: `ledger.html?locale=${this.locale}` });
    });
  }

  dispose() {
  }
}

