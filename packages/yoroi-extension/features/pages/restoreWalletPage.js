// @flow

import type { LocatorObject } from '../support/webdriver';
import type { RestorationInput } from '../mock-chain/TestWallets';
import { Key } from 'selenium-webdriver';

export const getWords = (word: string): LocatorObject => {
  return { locator: `//span[contains(text(), '${word}')]`, method: 'xpath' };
};

export const enterRecoveryPhrase = async (customWorld: any, phrase: string) => {
  const recoveryPhrase = phrase.split(' ');
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const recoveryPhraseElement = await customWorld.findElement(recoveryPhraseField);
    await recoveryPhraseElement.sendKeys(recoveryPhrase[i], Key.RETURN);
    if (i === 0) await customWorld.driver.sleep(500);
  }
}

export const inputMnemonicForWallet = async (
  customWorld: any,
  restoreInfo: RestorationInput
): Promise<void> => {
  await customWorld.input(walletNameInput, restoreInfo.name);
  await enterRecoveryPhrase(customWorld, restoreInfo.mnemonic);
  await customWorld.input(walletPasswordInput, restoreInfo.password);
  await customWorld.input(repeatPasswordInput, restoreInfo.password);
  await customWorld.click(confirmConfirmationButton);
}

export const restoreWalletInputPhraseDialog: LocatorObject = { locator: '.WalletRestoreDialog', method: 'css' };
export const errorInvalidRecoveryPhrase: LocatorObject = {
  locator: '//p[contains(@class, "-error") and contains(@id, "recoveryPhrase")]',
  method: 'xpath',
};
export const recoveryPhraseField: LocatorObject = {
  locator: '//input[starts-with(@id, "downshift-") and contains(@id, "-input")]',
  method: 'xpath',
};
export const proceedRecoveryButton: LocatorObject = {
  locator: 'primaryButton',
  method: 'id',
};
export const cleanRecoverInput: LocatorObject = {
  locator: '.AutocompleteOverridesClassic_autocompleteWrapper input',
  method: 'css',
};
export const walletNameInput: LocatorObject = { locator: "input[name='walletName']", method: 'css' };
export const confirmRestoreWalletButton: LocatorObject = { locator: '.WalletRestoreDialog .primary', method: 'css' };
export const walletPasswordInput: LocatorObject = { locator: "input[name='walletPassword']", method: 'css' };
export const repeatPasswordInput: LocatorObject = { locator: "input[name='repeatPassword']", method: 'css' };
export const paperPasswordInput: LocatorObject = { locator: "input[name='paperPassword']", method: 'css' };
export const confirmButton: LocatorObject = { locator: '.confirmButton', method: 'css' };
export const confirmConfirmationButton: LocatorObject = { locator: '.WalletRestoreDialog .primary', method: 'css' };
export const verifyRestoredInfoDialog: LocatorObject = { locator: '.WalletRestoreVerifyDialog_dialog', method: 'css' };
export const restoringDialogPlate: LocatorObject = { locator: '.WalletRestoreVerifyDialog_plateIdSpan', method: 'css' };