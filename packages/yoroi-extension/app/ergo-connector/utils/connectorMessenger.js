// @flow
export class ConnectorMessenger {
    constructor() {
        this.initedConnecting = false
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

}