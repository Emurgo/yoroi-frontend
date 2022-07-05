// @flow

const WebSocket = require('ws');

class TrezorEmulatorControllerError extends Error {}

export class TrezorEmulatorController {
  websocketUrl: string = 'ws://localhost:9001/';
  id: number = 0;
  ws: Object;
  logger: Object;

  constructor(logger: Object) {
    this.logger = logger;
  }

  _customPromise(json: Object, functionName: string, logger: Object): Promise<Object> {
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

  _innerConnect(websocketUrl: string, logger: Object): Promise<Object> {
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

  async connect(): Promise<TrezorEmulatorController> {
    this.logger.info(`connect: Connecting to websocket ${this.websocketUrl}`);
    this.ws = await this._innerConnect(this.websocketUrl, this.logger);

    return this;
  }

  handleMessage(event: Object, logger: Object): Object {
    if (!event.data || typeof event.data !== 'string') {
      logger.error(`handleMessage: Response received without proper data: ${event.data}`);
      throw new TrezorEmulatorControllerError(
        `Response received without proper data: ${event.data}`
      );
    }

    const dataObject = JSON.parse(event.data);

    if ('background_check' in dataObject && dataObject.background_check) {
      logger.info(`handleMessage: Background check`);
      return dataObject;
    }

    if ('success' in dataObject) {
      if (dataObject.success) {
        logger.info(`handleMessage: The response is successful`);
      } else {
        logger.error(`handleMessage: The response is fail`);
      }
    }

    return dataObject;
  }

  _send(json: Object, logger: Object, functionName: string): void {
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

  _sendOnBackground(json: Object): void {
    this.ws.send(JSON.stringify(json));
  }

  closeWsConnection(): void {
    this.logger.info(`closeWsConnection: Closing the connection`);
    this.ws.close();
    this.logger.info(`closeWsConnection: The connection is closed`);
  }

  emulatorStart(logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'emulator-start',
      version: '2-master',
    };

    return this._customPromise(requestJson, 'emulatorStart', logger);
  }

  emulatorWipe(logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'emulator-wipe',
    };

    return this._customPromise(requestJson, 'emulatorWipe', logger);
  }

  emulatorResetDevice(logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'emulator-reset-device',
    };

    return this._customPromise(requestJson, 'emulatorResetDevice', logger);
  }

  emulatorResetDeviceShamir(logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'emulator-reset-device',
      use_shamir: true,
    };

    return this._customPromise(requestJson, 'emulatorResetDeviceShamir', logger);
  }

  emulatorSetup(mnemonic: string, logger: Object = this.logger): Promise<Object> {
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

  emulatorPressYes(logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'emulator-press-yes',
    };

    return this._customPromise(requestJson, 'emulatorPressYes', logger);
  }

  emulatorPressNo(logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'emulator-press-no',
    };

    return this._customPromise(requestJson, 'emulatorPressNo', logger);
  }

  emulatorAllowUnsafe(logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'emulator-allow-unsafe-paths',
    };

    return this._customPromise(requestJson, 'emulatorAllowUnsafe', logger);
  }

  emulatorStop(logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'emulator-stop',
    };

    return this._customPromise(requestJson, 'emulatorStop', logger);
  }

  bridgeStart(bridgeVersion: string, logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'bridge-start',
      version: bridgeVersion || '2.0.31',
    };

    return this._customPromise(requestJson, 'bridgeStart', logger);
  }

  bridgeStop(logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'bridge-stop',
    };

    return this._customPromise(requestJson, 'bridgeStop', logger);
  }

  exit(logger: Object = this.logger): Promise<Object> {
    return new Promise((resolve, reject) => {
      this._send(
        {
          type: 'exit',
        },
        logger,
        'exit'
      );
      this.ws.onclose = () => {
        resolve(this.ws);
      };
      this.ws.onerror = err => {
        logger.error(`exit: The error is received:\n${err}`);
        reject(this.ws);
      };
    });
  }

  ping(logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'ping',
    };

    return this._customPromise(requestJson, 'ping', logger);
  }

  getLastEvent(logger: Object = this.logger): Promise<Object> {
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

  readAndConfirmMnemonic(logger: Object = this.logger): Promise<Object> {
    const requestJson = {
      type: 'emulator-read-and-confirm-mnemonic',
    };

    return this._customPromise(requestJson, 'readAndConfirmMnemonic', logger);
  }
}
