import AddWalletBase from '../addWalletBase.page.js';

class CreateWalletStepTwo extends AddWalletBase {
  // locators
  tipsModalLocator = {
    locator: 'infoDialog',
    method: 'id',
  };
  tipModalContinueButtonLocator = {
    locator: 'infoDialogContinueButton',
    method: 'id',
  };
  recoveryPharseBoxLocator = {
    locator: 'recoveryPhraseBox',
    method: 'id',
  };
  showRecoveryPhraseButtonLocator = {
    locator: 'toggleRecoveryPhraseButton',
    method: 'id',
  };
  _getRecoveryPhraseWordLocator = index => {
    return {
      locator: `recoveryPhraseWord${index}`,
      method: 'id',
    };
  };
  // functions
  async _collectAllWords() {
    const allWords = [];
    for (let wordIndex = 0; wordIndex < 15; wordIndex++) {
      const wordRaw = await this.getText(this._getRecoveryPhraseWordLocator(wordIndex));
      const wordClean = wordRaw.split(' ')[1];
      allWords.push(wordClean);
    }

    return allWords;
  }
  async closeTipsModalWindow() {
    this.logger.info(`CreateWalletStepTwo::closeTipsModalWindow is called`);
    await this.waitForElement(this.tipsModalLocator);
    await this.waitForElement(this.tipModalContinueButtonLocator);
    await this.click(this.tipModalContinueButtonLocator);
  }
  async recoveryPhraseIsBlurred() {
    this.logger.info(`CreateWalletStepTwo::recoveryPhraseIsBlurred is called`);
    const allWordsBlurValues = [];
    for (let wordIndex = 0; wordIndex < 15; wordIndex++) {
      const blurValue = await this.getCssValue(
        this._getRecoveryPhraseWordLocator(wordIndex),
        'filter'
      );
      allWordsBlurValues.push(blurValue);
    }
    return allWordsBlurValues.every(word => word.includes('blur'));
  }
  async toggleVisibilityOfRecoveryPhrase() {
    this.logger.info(`CreateWalletStepTwo::toggleVisibilityOfRecoveryPhrase is called`);
    await this.waitForElement(this.showRecoveryPhraseButtonLocator);
    await this.click(this.showRecoveryPhraseButtonLocator);
  }
  async saveRecoveryPhrase() {
    this.logger.info(`CreateWalletStepTwo::saveRecoveryPhrase is called`);
    const recoveryPhrase = await this._collectAllWords();
    await this.saveToLocalStorage('recoveryPhrase', recoveryPhrase);
  }
}

export default CreateWalletStepTwo;
