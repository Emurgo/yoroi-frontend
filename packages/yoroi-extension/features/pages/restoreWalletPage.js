// @flow

import type { LocatorObject } from '../support/webdriver';

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

export const getWords = (word: string): LocatorObject => {
  return { locator: `//span[contains(text(), '${word}')]`, method: 'xpath' };
};

export const walletNameInput: LocatorObject = { locator: "input[name='walletName']", method: 'css' };
export const restoreWalletButton: LocatorObject = { locator: '.WalletRestoreDialog .primary', method: 'css' };
export const walletPasswordInput: LocatorObject = { locator: "input[name='walletPassword']", method: 'css' };
export const repeatPasswordInput: LocatorObject = { locator: "input[name='repeatPassword']", method: 'css' };
export const paperPasswordInput: LocatorObject = { locator: "input[name='paperPassword']", method: 'css' };
export const confirmButton: LocatorObject = { locator: '.confirmButton', method: 'css' };
