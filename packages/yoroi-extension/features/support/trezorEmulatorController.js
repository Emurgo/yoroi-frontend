// @flow

export class TrezorEmulatorController {
  websocketUrl = 'ws://localhost:9001/';
  id = 0;
  ws: Object;

  constructor() {
    // Connect to Web Socket
    this.ws = new WebSocket(this.websocketUrl);
    // Set event handlers.
    this.ws.onopen = function () {
      // TODO log message
      // output('Websocket opened');
    };
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = function () {
      // TODO log message
      // output('Websocket closed');
    };
    this.ws.onerror = function (e) {
      // TODO log message
      // output('onerror - please look into the console');
    };
  }

  currentTime = () => {
    const now = new Date();
    const hours = ('0' + now.getHours()).slice(-2)
    const minutes = ('0' + now.getMinutes()).slice(-2)
    const seconds = ('0' + now.getSeconds()).slice(-2)
    return `${hours}:${minutes}:${seconds}`;
  };

  handleMessage = (event) => {
    if (!event.data || typeof event.data !== 'string') {
      // TODO log message
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
    // output(`Request sent: ${requestToSend}`, 'blue');
  }

  _sendOnBackground(json) {
    this.ws.send(JSON.stringify(json));
  }

  closeWsConnection() {
    this.ws.close();
  }

  emulatorStart() {
    this._send({
      type: 'emulator-start',
      version: '2-master',
    });
  }

  emulatorWipe() {
    this._send({
      type: 'emulator-wipe',
    });
  }

  emulatorResetDevice() {
    this._send({
      type: 'emulator-reset-device',
    });
  }

  emulatorResetDeviceShamir() {
    this._send({
      type: 'emulator-reset-device',
      use_shamir: true,
    });
  }

  emulatorSetup(mnemonic: string) {
    this._send({
      type: 'emulator-setup',
      mnemonic: mnemonic || 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      pin: '',
      passphrase_protection: false,
      label: 'Hello!',
    });
  }

  emulatorPressYes() {
    this._send({
      type: 'emulator-press-yes',
    });
  }

  emulatorPressNo() {
    this._send({
      type: 'emulator-press-no',
    });
  }

  emulatorAllowUnsafe() {
    this._send({
      type: 'emulator-allow-unsafe-paths',
    });
  }

  emulatorStop() {
    this._send({
      type: 'emulator-stop',
    });
  }

  bridgeStart(bridgeVersion: string) {
    this._send({
      type: 'bridge-start',
      version: bridgeVersion || '2.0.31',
    });
  }

  bridgeStop() {
    this._send({
      type: 'bridge-stop',
    });
  }

  exit() {
    this._send({
      type: 'exit',
    });
  }

  ping() {
    this._send({
      type: 'ping',
    });
  }

  readAndConfirmMnemonic() {
    this._send({
      type: 'emulator-read-and-confirm-mnemonic',
    });
  }
}
