import AddWalletBase from '../addWalletBase.page.js';

class CreateWalletStepOne extends AddWalletBase {
  // locators
  // info panel
  // learn more link
  learnAboutComponentLocator = {
    locator: 'learnAboutRecoveryPhraseComponent',
    method: 'id',
  };
  // functions
  // check info panel (expected text, language)
  async backOnPreviousStep() {
    this.logger.info(`CreateWalletStepOne::backOnPreviousStep is called`);
    await this.waitForElement(this.learnAboutComponentLocator);
    await this.waitForElement(this.backButtonLocator);
    await this.click(this.backButtonLocator);
  }
  async continue() {
    this.logger.info(`CreateWalletStepOne::continue is called`);
    await this.waitForElement(this.learnAboutComponentLocator);
    await this.waitForElement(this.nextButtonLocator);
    await this.click(this.nextButtonLocator);
  }
}

export default CreateWalletStepOne;
