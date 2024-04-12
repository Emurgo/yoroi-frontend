import AddWalletBase from '../addWalletBase.page.js';

class RestoreWalletStepOne extends AddWalletBase {
  // locators
  fifteenWordButtonLocator = {
    locator: 'fifteenWordsButton',
    method: 'id',
  };
  twentyFourWordsButtonLocator = {
    locator: 'twentyfourWordsButton',
    method: 'id',
  };
  // functions
  async selectFifteenWordWallet() {
    this.logger.info(`RestoreWalletStepOne::selectFifteenWordWallet is called`);
    await this.waitForElement(this.fifteenWordButtonLocator);
    await this.click(this.fifteenWordButtonLocator);
  }
  async selectTwentyFourWordWallet() {
    this.logger.info(`RestoreWalletStepOne::selectTwentyFourWordWallet is called`);
    await this.waitForElement(this.twentyFourWordsButtonLocator);
    await this.click(this.twentyFourWordsButtonLocator);
  }
}

export default RestoreWalletStepOne;
