// @flow

const WebSocket = require('ws');

class TrezorEmulatorControllerError extends Error {}

export class TrezorEmulatorController {
  websocketUrl = 'ws://localhost:9001/';
  id = 0;
  ws: Object;
  logger: Object;

  constructor(logger: Object) {
    this.logger = logger;
  }

  _customPromise(json, functionName, logger) {
    return new Promise((resolve, reject) => {
      this._send(json, logger, functionName);
      this.ws.onmessage = event => {
        const dataObject = this.handleMessage(event, logger);
        logger.info(`${functionName}: The response is received:\n<- ${JSON.stringify(dataObject)}`);
        resolve(dataObject);
      };
      this.ws.onerror = err => {
        logger.error(`${functionName}: The error is received:\n<- ${err}`);
        reject(this.ws);
      };
    });
  }

  _innerConnect(websocketUrl: string, logger: Object) {
    return new Promise((resolve, reject) => {
      const server = new WebSocket(websocketUrl);
      server.onopen = function () {
        logger.info(`_innerConnect: Connection is open`);
        resolve(server);
      };
      server.onerror = function (err) {
        logger.error(`_innerConnect: Connection is rejected. Reason: ${JSON.stringify(err)}`);
        reject(err);
      };
    });
  }

  async connect() {
    this.logger.info(`connect: Connecting to websocket ${this.websocketUrl}`);
    this.ws = await this._innerConnect(this.websocketUrl, this.logger);

    return this;
  }

  handleMessage = (event, logger): Object | void => {
    if (!event.data || typeof event.data !== 'string') {
      logger.error(`handleMessage: Response received without proper data: ${event.data}`);
      throw new TrezorEmulatorControllerError(
        `Response received without proper data: ${event.data}`
      );
    }

    const dataObject = JSON.parse(event.data);

    if ('background_check' in dataObject && dataObject.background_check) {
      logger.info(`handleMessage: Background check`);
      return;
    }

    if ('success' in dataObject) {
      if (dataObject.success) {
        logger.info(`handleMessage: The response is successful`);
      } else {
        logger.error(`handleMessage: The response is fail`);
      }
    }

    return dataObject;
  };

  _send(json, logger, functionName) {
    const tempId = this.id;
    const requestToSend = JSON.stringify(
      Object.assign(json, {
        tempId,
      })
    );
    this.ws.send(requestToSend);
    this.id++;
    logger.info(`${functionName}._send: Request sent:\n-> ${requestToSend}`);
  }

  _sendOnBackground(json) {
    this.ws.send(JSON.stringify(json));
  }

  closeWsConnection() {
    this.logger.info(`closeWsConnection: Closing the connection`);
    this.ws.close();
    this.logger.info(`closeWsConnection: The connection is closed`);
  }

  emulatorStart(logger = this.logger) {
    const requestJson = {
      type: 'emulator-start',
      version: '2-master',
    };

    return this._customPromise(requestJson, 'emulatorStart', logger);
  }

  emulatorWipe(logger = this.logger) {
    const requestJson = {
      type: 'emulator-wipe',
    };

    return this._customPromise(requestJson, 'emulatorWipe', logger);
  }

  emulatorResetDevice(logger = this.logger) {
    const requestJson = {
      type: 'emulator-reset-device',
    };

    return this._customPromise(requestJson, 'emulatorResetDevice', logger);
  }

  emulatorResetDeviceShamir(logger = this.logger) {
    const requestJson = {
      type: 'emulator-reset-device',
      use_shamir: true,
    };

    return this._customPromise(requestJson, 'emulatorResetDeviceShamir', logger);
  }

  emulatorSetup(mnemonic: string, logger = this.logger) {
    const requestJson = {
      type: 'emulator-setup',
      mnemonic:
        mnemonic ||
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      pin: '',
      passphrase_protection: false,
      label: 'Emulator',
    };

    return this._customPromise(requestJson, 'emulatorSetup', logger);
  }

  emulatorPressYes(logger = this.logger) {
    const requestJson = {
      type: 'emulator-press-yes',
    };

    return this._customPromise(requestJson, 'emulatorPressYes', logger);
  }

  emulatorPressNo(logger = this.logger) {
    const requestJson = {
      type: 'emulator-press-no',
    };

    return this._customPromise(requestJson, 'emulatorPressNo', logger);
  }

  emulatorAllowUnsafe(logger = this.logger) {
    const requestJson = {
      type: 'emulator-allow-unsafe-paths',
    };

    return this._customPromise(requestJson, 'emulatorAllowUnsafe', logger);
  }

  emulatorStop(logger = this.logger) {
    const requestJson = {
      type: 'emulator-stop',
    };

    return this._customPromise(requestJson, 'emulatorStop', logger);
  }

  bridgeStart(bridgeVersion: string, logger = this.logger) {
    const requestJson = {
      type: 'bridge-start',
      version: bridgeVersion || '2.0.31',
    };

    return this._customPromise(requestJson, 'bridgeStart', logger);
  }

  bridgeStop(logger = this.logger) {
    const requestJson = {
      type: 'bridge-stop',
    };

    return this._customPromise(requestJson, 'bridgeStop', logger);
  }

  exit(logger = this.logger) {
    return new Promise((resolve, reject) => {
      this._send({
        type: 'exit',
      });
      this.ws.onclose = () => {
        resolve(this.ws);
      };
      this.ws.onerror = err => {
        logger.error(`exit: The error is received:\n${err}`);
        reject(this.ws);
      };
    });
  }

  ping(logger = this.logger) {
    const requestJson = {
      type: 'ping',
    };

    return this._customPromise(requestJson, 'ping', logger);
  }

  getLastEvent(logger = this.logger) {
    return new Promise((resolve, reject) => {
      this.ws.onmessage = event => {
        const dataObject = this.handleMessage(event, logger);
        resolve(dataObject);
      };
      this.ws.onerror = err => {
        logger.error(`getLastEvent: The error is received:\n${err}`);
        reject(this.ws);
      };
    });
  }

  readAndConfirmMnemonic(logger = this.logger) {
    const requestJson = {
      type: 'emulator-read-and-confirm-mnemonic',
    };

    return this._customPromise(requestJson, 'readAndConfirmMnemonic', logger);
  }
}
