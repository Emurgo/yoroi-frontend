import { WalletWordsSize } from '../../../helpers/constants.js';
import AddWalletBase from '../addWalletBase.page.js';

class CreateWalletStepThree extends AddWalletBase {
  // locators
  verifyPhraseComponentLocator = {
    locator: 'verifyRecoveryPhraseStepComponent',
    method: 'id',
  };
  incorrectOrderLabelLocator = {
    locator: 'incorrectOrderMessage',
    method: 'id',
  };
  phraseValidTextLocator = {
    locator: 'isValidPhraseMessage',
    method: 'id',
  };
  _getRecoveryPhraseBoxLocator = wordIndex => {
    return {
      locator: `verifyRecoveryPhraseWord${wordIndex}`,
      method: 'id',
    };
  };
  // functions
  _wordIsAdded = async wordWebElement => {
    const cursorState = await wordWebElement.getCssValue('cursor');
    return cursorState === 'not-allowed';
  };
  async getRecoveryPhraseFromStorage() {
    this.logger.info(`CreateWalletStepThree::getRecoveryPhraseFromStorage is called`);
    const result = await this.getFromLocalStorage('recoveryPhrase');
    return result;
  }
  async enterRecoveryPhrase(recoveryPhrase) {
    this.logger.info(`CreateWalletStepThree::enterRecoveryPhrase is called`);
    await this.waitForElement(this.verifyPhraseComponentLocator);
    for (const recoveryPhraseWord of recoveryPhrase) {
      for (let wordIndex = 0; wordIndex < WalletWordsSize.Shelley; wordIndex++) {
        const elementLocator = this._getRecoveryPhraseBoxLocator(wordIndex);
        const webElement = await this.findElement(elementLocator);
        const wordIsAdded = await this._wordIsAdded(webElement);
        if (!wordIsAdded) {
          const elementText = await webElement.getText();
          if (elementText === recoveryPhraseWord) {
            await webElement.click();
            break;
          }
        }
      }
    }
    await this.sleep(200);
  }
  async recoveryPhraseIsValid() {
    this.logger.info(`CreateWalletStepThree::recoveryPhraseIsValid is called`);
    const isDisplayed = await (await this.findElement(this.phraseValidTextLocator)).isDisplayed();
    return isDisplayed;
  }
}

export default CreateWalletStepThree;
