import { fiveSeconds, quarterSecond } from '../../helpers/timeConstants.js';
import DAppBase from './dAppBase.page.js';

class DAppSignBase extends DAppBase {
  // locators
  cancelButtonLocator = {
    locator: 'cancelButton',
    method: 'id',
  };
  confirmButtonLocator = {
    locator: 'confirmButton',
    method: 'id',
  };
  errorBlockLocator = {
    locator: '.ErrorBlock_component',
    method: 'css',
  };
  passwordInputLocator = {
    locator: 'walletPassword',
    method: 'id',
  };
  // connection info
  connectedToUrlLabelLocator = {
    locator: 'connectedToUrl',
    method: 'id',
  };
  connectedWalletNameLocator = {
    locator: 'connectedWalletName',
    method: 'id',
  };
  connectedWalletPlateLocator = {
    locator: 'connectedWalletPlate',
    method: 'id',
  };

  detailsTabName = 'Details';
  utxosTabName = 'UTxOs';
  connectionTabName = 'Connection';

  getTabButtonLocator = tabName => {
    return {
      locator: `//div[@role="tablist"]/button/div[text()="${tabName}"]`,
      method: 'xpath',
    };
  };
  // functions
  async enterPassword(password) {
    this.logger.info(`DAppSignBase::enterPassword is called`);
    await this.waitForElement(this.passwordInputLocator);
    await this.input(this.passwordInputLocator, password);
  }
  async cancelSigning() {
    this.logger.info(`DAppSignBase::cancelSigning is called`);
    await this.waitForElement(this.cancelButtonLocator);
    await this.click(this.cancelButtonLocator);
  }
  async confirmSigning() {
    this.logger.info(`DAppSignBase::confirmSigning is called`);
    await this.waitForElement(this.confirmButtonLocator);
    const buttonIsEnabled = await this.customWaiter(
      async () => {
        const buttonlIsEnabled = await this.getAttribute(this.confirmButtonLocator, 'disabled');
        return buttonlIsEnabled === null;
      },
      fiveSeconds,
      quarterSecond
    );
    if (buttonIsEnabled) {
      await this.click(this.confirmButtonLocator);
    } else {
      this.logger.error(`DAppSignBase::confirmSigning The button Confirm is not enabled`);
      throw new Error('The button Confirm is not enabled');
    }
  }
  async switchToDetailsTab() {
    this.logger.info(`DAppSignBase::switchToDetailsTab is called`);
    const tabLocator = this.getTabButtonLocator(this.detailsTabName);
    await this.click(tabLocator);
  }
  async switchToUtxosTab() {
    this.logger.info(`DAppSignBase::switchToUtxosTab is called`);
    const tabLocator = this.getTabButtonLocator(this.utxosTabName);
    await this.click(tabLocator);
  }
  async switchToConnectionTab() {
    this.logger.info(`DAppSignBase::switchToConnectionTab is called`);
    const tabLocator = this.getTabButtonLocator(this.connectionTabName);
    await this.click(tabLocator);
  }
  async getConnectionInfo() {
    this.logger.info(`DAppSignBase::getConnectionInfo is called`);
    await this.switchToConnectionTab();
    await this.waitForElement(this.connectedToUrlLabelLocator);
    const pageUrl = await this.getText(this.connectedToUrlLabelLocator);
    const walletName = await this.getText(this.connectedWalletNameLocator);
    const walletPlate = await this.getText(this.connectedWalletPlateLocator);
    return {
      pageUrl,
      walletName,
      walletPlate,
    };
  }
}

export default DAppSignBase;
