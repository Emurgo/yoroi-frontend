// @flow

import type { LocatorObject } from '../support/webdriver';

export const nextButton: LocatorObject = {
  locator: 'primaryButton',
  method: 'id',
};
export const backButton: LocatorObject = {
  locator: 'secondaryButton',
  method: 'id',
};
export const createWalletWarning: LocatorObject = { locator: 'learnAboutRecoveryPhraseComponent', method: 'id' };
export const recoveryPhraseBox: LocatorObject = { locator: 'recoveryPhraseBox', method: 'id' };
export const getRecoveryPhraseWord = (wordIndex: number): LocatorObject => {
  return { locator: `recoveryPhraseWord${wordIndex}`, method: 'id' };
};
export const getFullRecoveryPhrase = async (customWorld: any): Promise<Array<string>> => {
  const fullPhraseArray = [];
  for (let index = 0; index < 15; index++) {
    const wordLocator = getRecoveryPhraseWord(index);
    const rawWord: string = await (await customWorld.findElement(wordLocator)).getText();
    const onlyWord = rawWord.split(' ')[1]
    fullPhraseArray.push(onlyWord);
  }

  return fullPhraseArray;
}
export const toggleRecoveryPhraseBlurButton: LocatorObject = {
  locator: 'toggleRecoveryPhraseButton',
  method: 'id',
};
export const verifyRecoveryPhraseBox: LocatorObject = { locator: 'verifyRecoveryPhraseStepComponent', method: 'id' };
export const getVerifyRecoveryPhraseWordButton = (wordIndex: number): LocatorObject => {
  return { locator: `verifyRecoveryPhraseWord${wordIndex}`, method: 'id' };
};
export const enterFullRecoveryPhrase = async (
  customWorld: any,
  recoveryPhraseArray: Array<string>
): Promise<void> => {
  for (const wordToFind of recoveryPhraseArray) {
    for (let index = 0; index < 15; index++) {
      const presentedWordLocator = getVerifyRecoveryPhraseWordButton(index);
      const isAdded = (await customWorld.getCssValue(presentedWordLocator, 'cursor')) === 'not-allowed'
      if (isAdded) {
        continue;
      }
      const presentedWord = await (await customWorld.findElement(presentedWordLocator)).getText();
      if (presentedWord === wordToFind) {
        await customWorld.click(presentedWordLocator)
        break;
      }
    }
  }
};
export const isValidPhraseMessage: LocatorObject = { locator: 'isValidPhraseMessage', method: 'id' };
export const addWalletDetailsBox: LocatorObject = { locator: 'addWalletDetailsStepComponent', method: 'id' };

// !!! OLD LOCATORS !!!
export const walletInfoDialog: LocatorObject = { locator: '.WalletCreateDialog', method: 'css' };
export const creationConfirmButton: LocatorObject = {
  locator: '.WalletCreateDialog .primary',
  method: 'css',
};
export const backupPrivacyWarningDialog: LocatorObject = {
  locator: '.WalletBackupPrivacyWarningDialog',
  method: 'css',
};
export const creationWarningContinueButton: LocatorObject = {
  locator: '.WalletBackupPrivacyWarningDialog .primary',
  method: 'css',
};
export const nobodyLooksCheckbox: LocatorObject = {
  locator: '.MuiFormControlLabel-root',
  method: 'css',
};
export const walletRecoveryPhraseDisplayDialog: LocatorObject = {
  locator: '.WalletRecoveryPhraseDisplayDialog',
  method: 'css',
};
export const mnemonicPhraseText: LocatorObject = {
  locator: '.WalletRecoveryPhraseMnemonic_component',
  method: 'css',
};
export const iWrittenDownButton: LocatorObject = {
  locator: '.WalletRecoveryPhraseDisplayDialog .primary',
  method: 'css',
};
export const recoveryPhraseEntryDialog: LocatorObject = {
  locator: '.WalletRecoveryPhraseEntryDialog',
  method: 'css',
};
const recoveryPhraseWord: LocatorObject = {
  locator: '.WalletRecoveryPhraseEntryDialog_words .MnemonicWord_component',
  method: 'css',
};
export const repeatRecoveryPhrase = async (
  customWorld: any,
  mnemonicPhrase: string
): Promise<void> => {
  const mnemonicPhraseSplit = mnemonicPhrase.split(' ');
  for (const mnemonicPhraseWord of mnemonicPhraseSplit) {
    const allWords = await customWorld.findElements(recoveryPhraseWord);
    for (const wordElement of allWords) {
      const elementText = await wordElement.getText();
      if  (elementText !== mnemonicPhraseWord) continue;
      await wordElement.click();
    }
  }
  await customWorld.driver.sleep(500);
};

const recoveryPhraseEntryDialogCheckboxes: LocatorObject = { locator: '.WalletRecoveryPhraseEntryDialog_checkbox', method: 'css' };

export const checkRecoveryPhrase2Checkboxes = async (customWorld: any) => {
  const allCheckboxes = await customWorld.findElements(recoveryPhraseEntryDialogCheckboxes);
  for (const checkbox of allCheckboxes) {
    await checkbox.click();
  }
}

export const recoveryPhraseEntryDialogConfirmButton: LocatorObject = { locator: '.WalletRecoveryPhraseEntryDialog .primary', method: 'css' };
