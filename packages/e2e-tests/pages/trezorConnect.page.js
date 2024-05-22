import { defaultWaitTimeout, halfSecond } from '../helpers/timeConstants.js';
import BasePage from './basepage.js';

class TrezorConnect extends BasePage {
  // locators
  dontAskAgainCheckboxLocator = {
    locator: '.custom-checkbox',
    method: 'css',
  };
  confirmUsingTrezorButtonLocator = {
    locator: '.confirm',
    method: 'css',
  };
  exportTrezorButtonLocator = {
    locator: '.confirm',
    method: 'css',
  };
  // functions
  async tickCheckbox() {
    this.logger.info(`TrezorConnect::tickCheckbox is called`);
    const result = await this.customWaiter(
      async () => {
        const elAmount = await this.findElements(this.dontAskAgainCheckboxLocator);
        this.logger.info(`TrezorConnect::tickCheckbox. Elements found: ${elAmount.length}`);
        // this conditions was found empirically
        return elAmount.length === 4;
      },
      defaultWaitTimeout,
      halfSecond
    );
    if (result) {
      const allCheckboxes = await this.findElements(this.dontAskAgainCheckboxLocator);
      // this conditions was found empirically
      await allCheckboxes[0].click();
    } else {
      this.logger.error(`TrezorConnect::tickCheckbox A correct checkbox is not found`);
      throw new Error('A correct checkbox is not found');
    }
  }
  async allowConnection() {
    this.logger.info(`TrezorConnect::allowConnection is called`);
    await this.waitForElement(this.confirmUsingTrezorButtonLocator);
    await this.clickByScript(this.confirmUsingTrezorButtonLocator);
  }
  async allowPubKeysExport() {
    this.logger.info(`TrezorConnect::allowPubKeysExport is called`);
    await this.waitForElement(this.exportTrezorButtonLocator);
    await this.clickByScript(this.exportTrezorButtonLocator);
  }
}

export default TrezorConnect;
