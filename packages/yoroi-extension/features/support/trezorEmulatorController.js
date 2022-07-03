// @flow

const WebSocket = require('ws');

export class TrezorEmulatorController {
  websocketUrl = 'ws://localhost:9001/';
  id = 0;
  ws: Object;

  // constructor() {
  //   // Connect to Web Socket
  //   this.ws = new WebSocket(this.websocketUrl);
  //   // Set event handlers.
  //   this.ws.onopen = function () {
  //     // TODO log message
  //     // output('Websocket opened');
  //   };
  //   this.ws.onmessage = this.handleMessage;
  //   this.ws.onclose = function () {
  //     // TODO log message
  //     // output('Websocket closed');
  //   };
  //   this.ws.onerror = function (e) {
  //     // TODO log message
  //     // output('onerror - please look into the console');
  //   };
  // }

  _innerConnect (websocketUrl = this.websocketUrl) {
    return new Promise((resolve, reject) => {
      const server = new WebSocket(websocketUrl);
      server.onopen = function() {
        resolve(server);
      };
      server.onerror = function(err) {
        reject(err)
      }
    });
  }

  async connect() {
    this.ws = await this._innerConnect();
    return this;
  }

  currentTime = () => {
    const now = new Date();
    const hours = ('0' + now.getHours()).slice(-2)
    const minutes = ('0' + now.getMinutes()).slice(-2)
    const seconds = ('0' + now.getSeconds()).slice(-2)
    return `${hours}:${minutes}:${seconds}`;
  };

  handleMessage = (event): Object|void => {
    if (!event.data || typeof event.data !== 'string') {
      // TODO log message
      // TODO Throw error
      // output(`Response received without proper data: ${event.data}`, 'red');
      return;
    }

    const dataObject = JSON.parse(event.data);

    // When the check is happening on the background (not forced by user),
    //   do not print anything to the Log (but perform the UI update)
    if ('background_check' in dataObject && dataObject.background_check) {
      // TODO log message
      return;
    }

    // Choosing the right color for the output - normal, success and error scenarios
    if ('success' in dataObject) {
      if (dataObject.success) {
        // TODO log message
      } else {
        // TODO log message
      }
    }

    // TODO log message
    // output(`Response received: ${event.data}`, color);
    return dataObject;
  };

  _send(json) {
    const tempId = this.id;
    const requestToSend = JSON.stringify(
      Object.assign(json, {
        tempId,
      }),
    );
    this.ws.send(requestToSend);
    this.id++;
    // TODO log message
    console.log(`Request sent: ${requestToSend}`);
    // output(`Request sent: ${requestToSend}`, 'blue');
  }

  _sendOnBackground(json) {
    this.ws.send(JSON.stringify(json));
  }

  closeWsConnection() {
    this.ws.close();
  }

  emulatorStart() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'emulator-start',
        version: '2-master',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  emulatorWipe() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'emulator-wipe',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  emulatorResetDevice() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'emulator-reset-device',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  emulatorResetDeviceShamir() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'emulator-reset-device',
        use_shamir: true,
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  emulatorSetup(mnemonic: string) {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'emulator-setup',
        mnemonic: mnemonic || 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        pin: '',
        passphrase_protection: false,
        label: 'Emulator',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  emulatorPressYes() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'emulator-press-yes',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  emulatorPressNo() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'emulator-press-no',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  emulatorAllowUnsafe() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'emulator-allow-unsafe-paths',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  emulatorStop() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'emulator-stop',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  bridgeStart(bridgeVersion: string) {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'bridge-start',
        version: bridgeVersion || '2.0.31',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  bridgeStop() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'bridge-stop',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  exit() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'exit',
      });
      this.ws.onclose = () => {
        resolve(this.ws);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  ping() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'ping',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }

  getLastEvent() {
    return new Promise((resolve, reject) => {
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }


  readAndConfirmMnemonic() {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'emulator-read-and-confirm-mnemonic',
      });
      this.ws.onmessage = (event) => {
        const dataObject = this.handleMessage(event);
        resolve(dataObject);
      };
      this.ws.onerror = () => {
        reject(this.ws);
      };
    });
  }
}
