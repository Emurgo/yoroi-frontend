// @flow

import type { LocatorObject } from '../support/webdriver';
import type { RestorationInput } from '../mock-chain/TestWallets';
import { Key, WebElement } from 'selenium-webdriver';
import { walletNameInput, walletPasswordInput, repeatPasswordInput } from './walletDetailsPage';

export const getWords = (word: string): LocatorObject => {
  return { locator: `//span[contains(text(), '${word}')]`, method: 'xpath' };
};

export const enterRecoveryPhrase = async (customWorld: any, phrase: string) => {
  const recoveryPhrase = phrase.split(' ');
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const recoveryPhraseInputField = getRecoveryPhraseInput(i);
    const recoveryPhraseElement = await customWorld.findElement(recoveryPhraseInputField);
    await recoveryPhraseElement.sendKeys(recoveryPhrase[i], Key.RETURN);
  }
};

export const inputMnemonicForWallet = async (
  customWorld: any,
  restoreInfo: RestorationInput
): Promise<void> => {
  await enterRecoveryPhrase(customWorld, restoreInfo.mnemonic);
};

export const inputWalletInfo = async (customWorld: any, restoreInfo: RestorationInput) => {
  await customWorld.input(walletNameInput, restoreInfo.name);
  await customWorld.input(walletPasswordInput, restoreInfo.password);
  await customWorld.input(repeatPasswordInput, restoreInfo.password);
};

export const restorePageTitle: LocatorObject = { locator: 'restoreTitle', method: 'id' };

export const restoreWalletInputPhraseDialog: LocatorObject = {
  locator: 'enterRecoveryPhraseStepComponent',
  method: 'id',
};

export const validPhraseText: LocatorObject = { locator: 'validPhraseMessage', method: 'id' };

export const clearAllButton: LocatorObject = { locator: 'clearAllButton', method: 'id' };

export const errorInvalidRecoveryPhrase: LocatorObject = {
  locator: '//p[contains(@class, "-error") and contains(@id, "recoveryPhrase")]',
  method: 'xpath',
};

export const getRecoveryPhraseInput = (inputIndex: number): LocatorObject => {
  return {
    locator: `downshift-${inputIndex}-input`,
    method: 'id',
  };
};

export const getAllRecoverPhraseInputs = async (customWorld: any): Promise<WebElement[]> => {
  const abstractInputLocator = {
    locator: '//input[contains(@id, "downshift-") and contains(@id, "-input")]',
    method: 'xpath',
  };
  return await customWorld.findElements(abstractInputLocator);
};

export const nextButton: LocatorObject = {
  locator: 'primaryButton',
  method: 'id',
};
export const cleanRecoverInput: LocatorObject = {
  locator: '.AutocompleteOverridesClassic_autocompleteWrapper input',
  method: 'css',
};
export const confirmRestoreWalletButton: LocatorObject = {
  locator: '.WalletRestoreDialog .primary',
  method: 'css',
};
export const confirmButton: LocatorObject = { locator: '.confirmButton', method: 'css' };
export const confirmConfirmationButton: LocatorObject = {
  locator: '.WalletRestoreDialog .primary',
  method: 'css',
};
export const verifyRestoredInfoDialog: LocatorObject = {
  locator: '.WalletRestoreVerifyDialog_dialog',
  method: 'css',
};
