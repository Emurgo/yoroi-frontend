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
    await this.waitPresentedAndAct(this.nextButtonLocator, async () => {
      const btnEnabled = await this.buttonIsEnabled(this.nextButtonLocator);
      if (btnEnabled) {
        await this.click(this.nextButtonLocator);
      } else {
        throw new Error(`The button ${this.nextButtonLocator.locator} is disabled`);
      }
    });
  }
  async backOnPreviousStep() {
    this.logger.info(`AddWalletBase::backOnPreviousStep is called`);
    await this.waitForElement(this.backButtonLocator);
    await this.click(this.backButtonLocator);
  }
}

export default AddWalletBase;
