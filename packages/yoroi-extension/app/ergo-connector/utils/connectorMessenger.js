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
        console.log(this)
        return this._sendMessage({ type: 'get_protocol' })
    }

    sendMsgConnect(): Promise<ConnectingMessage> {
        if (!this.initedConnecting) {
            this.initedConnecting = true
            return this._sendMessage({ type: 'connect_retrieve_data' })
        }
    }

    sendMsgSigningTx(): Promise<SigningMessage> {
        if (!this.initedSigning) {
            this.initedSigning = true
            return this._sendMessage({ type: 'tx_sign_window_retrieve_data' })
        }
    }

    getConnectedSites(): Promise<ConnectedSites>  {
        if(!this.initedSigning) {
            return this._sendMessage({ type: 'get_connected_sites' })
        }
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