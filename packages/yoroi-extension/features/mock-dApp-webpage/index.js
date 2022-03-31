// @flow

import { WebDriver } from 'selenium-webdriver';
// eslint-disable-next-line import/named
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';

class MockDAppWebpageError extends Error {}

type AccessCallBack = {|
  success: boolean,
  errMsg?: string,
|};

export class MockDAppWebpage {
  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async _requestAccess(auth: boolean = false) {
    const scriptString = `window.accessRequestPromise = cardano.yoroi.enable(${
      auth ? '{requestIdentification: true}' : ''
    })`;
    await this.driver.executeScript(scriptString);
  }

  async requestNonAuthAccess() {
    await this._requestAccess();
  }

  async requestAuthAccess() {
    await this._requestAccess(true);
  }

  async checkAccessRequest(): Promise<AccessCallBack> {
    return await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.accessRequestPromise
        // eslint-disable-next-line promise/always-return
        .then(api => {
          window.api = api;
          callback({ success: true });
        })
        .catch(error => {
          callback({ success: false, errMsg: error.message });
        });
    });
  }

  async getBalance(): Promise<string> {
    const balanceCborHex = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getBalance()
        // eslint-disable-next-line promise/always-return
        .then(balance => {
          callback(balance);
        })
        .catch(error => {
          throw new MockDAppWebpageError(JSON.stringify(error));
        });
    });

    const value = RustModule.WalletV4.Value.from_bytes(Buffer.from(balanceCborHex, 'hex'));
    return value.coin().to_str();
  }
}
