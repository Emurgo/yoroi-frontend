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
  async getRecoveryPhraseFromStorage() {
    this.logger.info(`CreateWalletStepThree::getRecoveryPhraseFromStorage is called`);
    const result = await this.getFromLocalStorage('recoveryPhrase');
    return result;
  }
  async enterRecoveryPhrase(recoveryPhrase) {
    this.logger.info(`CreateWalletStepThree::enterRecoveryPhrase is called`);
    await this.waitForElement(this.verifyPhraseComponentLocator);
    const arrayOfIndexes = [];
    for (let wordIndex = 0; wordIndex < WalletWordsSize.Shelley; wordIndex++) {
      arrayOfIndexes.push(wordIndex);
    }
    for (const recoveryPhraseWord of recoveryPhrase) {
      for (const wordIndex of arrayOfIndexes) {
        const elementLocator = this._getRecoveryPhraseBoxLocator(wordIndex);
        const wordButtonIsEnabled = await this.buttonIsEnabled(elementLocator);
        if (wordButtonIsEnabled) {
          const elementText = await this.getText(elementLocator);
          if (elementText === recoveryPhraseWord) {
            await this.click(elementLocator);
            const indexOfIndex = arrayOfIndexes.indexOf(wordIndex);
            arrayOfIndexes.splice(indexOfIndex, 1);
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
