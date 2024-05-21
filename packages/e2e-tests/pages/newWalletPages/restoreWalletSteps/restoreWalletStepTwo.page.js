import AddWalletBase from '../addWalletBase.page.js';
import { Key } from 'selenium-webdriver';
import { twoSeconds, quarterSecond } from '../../../helpers/timeConstants.js';

class RestoreWalletStepTwo extends AddWalletBase {
  // locators
  getRecoveryPhraseInputLocator = index => {
    return {
      locator: `downshift-${index}-input`,
      method: 'id',
    };
  };
  recoveryPhraseInputXpathLocator = {
    locator: '//input[starts-with(@id, "downshift-") and contains(@id, "-input")]',
    method: 'xpath',
  };
  recoveryPhraseVerifiedTextLocator = {
    locator: 'validPhraseMessage',
    method: 'id',
  };
  clearAllButtonLocator = {
    locator: 'clearAllButton',
    method: 'id',
  };
  // duplicated wallet dialog
  duplicatedWalletDialogLocator = {
    locator: 'duplicatedWalletDialog-dialog',
    method: 'id',
  };
  duplicatedWalletDialogTitleLocator = {
    locator: 'duplicatedWalletDialog-dialogTitle-text',
    method: 'id',
  };
  duplicatedWalletDialogCancelButtonLocator = {
    locator: 'duplicatedWalletDialog-cancel-button',
    method: 'id',
  };
  duplicatedWalletDialogOpenWalletButtonLocator = {
    locator: 'duplicatedWalletDialog-openWallet-button',
    method: 'id',
  };
  walletInfoNameLocator = {
    locator: 'walletInfo-walletName-text',
    method: 'id',
  };
  walletInfoPlateLocator = {
    locator: 'walletInfo-walletPlate-text',
    method: 'id',
  };
  walletInfoAmountLocator = {
    locator: 'walletInfo-amount-text',
    method: 'id',
  };
  getAllRecoveryPhrasesInputs = async () => {
    const inputsElements = await this.findElements(this.recoveryPhraseInputXpathLocator);
    return inputsElements;
  };
  // functions
  _enterRecoveryPhrase = async (wordsAmount, recoveryPhrase) => {
    let phraseTemplate = null;
    if (typeof recoveryPhrase === 'string') {
      phraseTemplate = recoveryPhrase.split(' ');
    } else {
      phraseTemplate = recoveryPhrase;
    }
    const allInputs = await this.getAllRecoveryPhrasesInputs();
    for (let wordIndex = 0; wordIndex < wordsAmount; wordIndex++) {
      const phraseWord = phraseTemplate[wordIndex];
      const inputElement = allInputs[wordIndex];
      await this.inputElem(inputElement, phraseWord + Key.RETURN);
    }
  };
  enterRecoveryPhrase15Words = async recoveryPhrase => {
    this.logger.info(`RestoreWalletStepTwo::enterRecoveryPhrase15Words is called`);
    await this._enterRecoveryPhrase(15, recoveryPhrase);
  };
  enterRecoveryPhrase24Words = async recoveryPhrase => {
    this.logger.info(`RestoreWalletStepTwo::enterRecoveryPhrase24Words is called`);
    await this._enterRecoveryPhrase(24, recoveryPhrase);
  };
  clearAllButtonIsEnabled = async () => {
    this.logger.info(`RestoreWalletStepTwo::clearAllButtonIsEnabled is called`);
    await this.waitForElement(this.clearAllButtonLocator);
    const clearAllIsEnabled = await this.getCssValue(this.clearAllButtonLocator, 'disabled');
    return clearAllIsEnabled === null;
  };
  clearAllInputs = async () => {
    this.logger.info(`RestoreWalletStepTwo::clearAllInputs is called`);
    const buttonIsEnabled = await this.clearAllButtonIsEnabled();
    if (buttonIsEnabled) {
      await this.click(this.clearAllButtonLocator);
    } else {
      throw new Error('The Clear All button is not enabled');
    }
  };
  clearAllInputsManually = async () => {
    const allInputs = await this.getAllRecoveryPhrasesInputs();
    for (const seedInput of allInputs) {
      const wordInputLength = (await this.getAttributeElement(seedInput, 'value')).length;
      for (let charIndex = 0; charIndex < wordInputLength; charIndex++) {
        await this.inputElem(seedInput, Key.BACK_SPACE);
      }
    }
  };
  allInputsAreEmpty = async () => {
    this.logger.info(`RestoreWalletStepTwo::allInputsAreEmpty is called`);
    const allInputs = await this.findElements(this.recoveryPhraseInputXpathLocator);
    const result = [];
    for (const wordInput of allInputs) {
      const inputsText = await this.getAttributeElement(wordInput, 'value');
      const inputIsEmpty = inputsText === '';
      result.push(inputIsEmpty);
    }
    return result.every(value => value === true);
  };
  recoveryPhraseIsVerified = async () => {
    this.logger.info(`RestoreWalletStepTwo::recoveryPhraseIsVerified is called`);
    const isDisplayed = await this.customWaiter(
      async () => {
        const allElements = await this.findElements(this.recoveryPhraseVerifiedTextLocator);
        return allElements.length === 1;
      },
      twoSeconds,
      quarterSecond
    );
    return isDisplayed;
  };
  duplicatedWalletDialogIsDisplayed = async () => {
    this.logger.info(`RestoreWalletStepTwo::duplicatedWalletDialogIsDisplayed is called`);
    const isDisplayed = await (
      await this.findElement(this.duplicatedWalletDialogLocator)
    ).isDisplayed();
    return isDisplayed;
  };
  getDuplicatedWalletName = async () => {
    this.logger.info(`RestoreWalletStepTwo::getDuplicatedWalletName is called`);
    const walletName = await this.getText(this.walletInfoNameLocator);
    return walletName;
  };
  getDuplicatedWalletPlate = async () => {
    this.logger.info(`RestoreWalletStepTwo::getDuplicatedWalletPlate is called`);
    const walletPlate = await this.getText(this.walletInfoPlateLocator);
    return walletPlate;
  };
  getDuplicatedWalletBalance = async () => {
    this.logger.info(`RestoreWalletStepTwo::getDuplicatedWalletBalance is called`);
    const walletBalanceRaw = await this.getText(this.walletInfoAmountLocator);
    const walletBalanceClean = parseFloat(walletBalanceRaw.split(' ')[0]);
    return walletBalanceClean;
  };
  openExistingWallet = async () => {
    this.logger.info(`RestoreWalletStepTwo::openExistingWallet is called`);
    await this.click(this.duplicatedWalletDialogOpenWalletButtonLocator);
  };
  cancelOpeningExistingWallet = async () => {
    this.logger.info(`RestoreWalletStepTwo::cancelOpeningExistingWallet is called`);
    await this.click(this.duplicatedWalletDialogCancelButtonLocator);
  };
}

export default RestoreWalletStepTwo;
