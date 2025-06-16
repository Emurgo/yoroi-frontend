import { defaultWaitTimeout, halfSecond } from '../helpers/timeConstants.js';
import BasePage from './basepage.js';

class LedgerConnect extends BasePage {
  // locators
  nanoSButtonLocator = {
    locator: 'ledgerConnect-selectNanoS-button',
    method: 'id',
  };
  nanoXButtonLocator = {
    locator: 'ledgerConnect-selectNanoX-button',
    method: 'id',
  };
  continueButtonLocator = {
    locator: '.DeviceSelectionBlock_button',
    method: 'css',
  };
  // functions
  async selectNanoS() {
    this.logger.info(`LedgerConnect::selectNanoS is called`);
    await this.waitPresentedAndAct(
      this.nanoSButtonLocator,
      async () => await this.click(this.nanoSButtonLocator)
    );
  }
  async selectNanoX() {
    this.logger.info(`LedgerConnect::selectNanoS is called`);
    await this.waitPresentedAndAct(
      this.nanoXButtonLocator,
      async () => await this.click(this.nanoXButtonLocator)
    );
  }

  async continue() {
    this.logger.info(`LedgerConnect::selectNanoS is called`);
    await this.waitPresentedAndAct(
      this.continueButtonLocator,
      async () => await this.click(this.continueButtonLocator)
    );
  }
}

export default LedgerConnect;
