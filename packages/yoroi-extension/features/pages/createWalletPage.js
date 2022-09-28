// @flow

import type { LocatorObject } from '../support/webdriver';

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
