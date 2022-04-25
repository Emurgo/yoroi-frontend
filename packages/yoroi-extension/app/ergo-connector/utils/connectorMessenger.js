// @flow

import type {
    ConfirmedSignData,
    ConnectedSites,
    ConnectingMessage,
    ConnectRetrieveData,
    FailedSignData,
    GetConnectedSitesData,
    Protocol,
    RemoveWalletFromWhitelistData,
    SigningMessage,
    TxSignWindowRetrieveData,
    GetUtxosRequest,
    ConnectResponseData,
    GetConnectionProtocolData,
} from '../../../chrome/extension/ergo-connector/types';
import type { IGetAllUtxosResponse } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

export class ConnectorMessenger {
    initedConnecting: boolean;
    initedSigning: boolean;

    constructor() {
        this.initedConnecting = false
        this.initedSigning = false
    }

    _sendMessage(
        message: (
            ConnectResponseData
            | ConfirmedSignData
            | FailedSignData
            | TxSignWindowRetrieveData
            | ConnectRetrieveData
            | RemoveWalletFromWhitelistData
            | GetConnectedSitesData
            | GetConnectionProtocolData
            | GetUtxosRequest
        )
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            window.chrome.runtime.sendMessage(
             message,
              response => {
                if (window.chrome.runtime.lastError) {
                  reject(new Error(`Could not establish connection: ${message.type} `));
                }
                resolve(response);
              }
            );
        });
    }

    getProtocol(): Promise<?Protocol> {
        return this._sendMessage({ type: 'get_protocol' })
    }

    sendMsgConnect(): Promise<ConnectingMessage> {
        return new Promise(resolve => {
            if(!this.initedConnecting) {
                resolve(this._sendMessage({ type: 'connect_retrieve_data' }));
                this.initedConnecting = true;
            }
        });
    }

    sendMsgSigningTx(): Promise<SigningMessage> {
        return new Promise(resolve => {
            if(!this.initedSigning) {
                resolve(this._sendMessage({ type: 'tx_sign_window_retrieve_data' }));
                this.initedSigning = true;
            }
        })
    }

    getConnectedSites(): Promise<ConnectedSites>  {
        return new Promise(resolve => {
            if(!this.initedSigning) {
                resolve(this._sendMessage({ type: 'get_connected_sites' }))
            }
        })
    }

    getUtxosAndAddresses(tabId: number, select: string[]): Promise<{|
        utxos: IGetAllUtxosResponse,
        usedAddresses: string[],
        unusedAddresses: string[],
        changeAddress: string,
      |}> {
        return this._sendMessage({ type: 'get_utxos/addresses', tabId, select })
    }

};