// @flow
export class ConnectorMessenger {
    constructor() {
        this.initedConnecting = false
        this.initedSigning = false
    }

    _sendMessage(message) {
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

    getProtocol() {
        return this._sendMessage({ type: 'get_protocol' })
    }

    sendMsgConnect() {
        if (!this.initedConnecting) {
            this.initedConnecting = true
            return this._sendMessage({ type: 'connect_retrieve_data' })
        }
    }

    sendMsgSigningTx() {
        if (!this.initedSigning) {
            this.initedSigning = true
            return this._sendMessage({ type: 'tx_sign_window_retrieve_data' })
        }
    }

    getLatestUtxos(tabId: number) {
        return this._sendMessage({ type: 'get_utxos/cardano', tabId })
    }

    getConnectedSites() {
        if(!this.initedSigning) {
            return this._sendMessage({ type: 'get_connected_sites' })
        }
    }

}