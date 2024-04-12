import BasePage from '../basepage.js';

class AddWalletBase extends BasePage {
  backButtonLocator = {
    locator: 'secondaryButton',
    method: 'id',
  };
  nextButtonLocator = {
    locator: 'primaryButton',
    method: 'id',
  };
  async continue() {
    this.logger.info(`AddWalletBase::continue is called`);
    await this.waitForElement(this.nextButtonLocator);
    await this.waitEnable(this.nextButtonLocator);
    await this.click(this.nextButtonLocator);
  }
  async backOnPreviousStep() {
    this.logger.info(`AddWalletBase::backOnPreviousStep is called`);
    await this.waitForElement(this.backButtonLocator);
    await this.click(this.backButtonLocator);
  }
}

export default AddWalletBase;
