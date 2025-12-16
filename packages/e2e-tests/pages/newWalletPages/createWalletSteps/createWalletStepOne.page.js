import AddWalletBase from '../addWalletBase.page.js';

class CreateWalletStepOne extends AddWalletBase {
  // locators
  // info panel
  // learn more link
  learnAboutComponentLocator = {
    locator: 'learnAboutRecoveryPhraseComponent',
    method: 'id',
  };
  learMoreLinkLocator = {
    locator: 'createWallet:stepOne-learnMore-link',
    method: 'id',
  };
  // functions
  async isDisplayed() {
    this.logger.info(`CreateWalletStepOne::isDisplayed is called`);
    return await this.customWaitIsPresented(this.learnAboutComponentLocator);
  }
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
  async getLearnMoreLink() {
    this.logger.info(`CreateWalletStepOne::getLearnMoreLink is called`);
    const linkElement = await this.findElement(this.learMoreLinkLocator);
    const result = await linkElement.getAttribute('href');
    this.logger.info(`CreateWalletStepOne::getTransferFaqLink::result ${result}`);
    return result;
  }
  async openLearMoreLink() {
    this.logger.info(`CreateWalletStepOne::openLearMoreLink is called`);
    await this.click(this.learMoreLinkLocator);
  }
}

export default CreateWalletStepOne;
