// @flow

import type { LocatorObject } from '../support/webdriver';

export const errorInvalidRecoveryPhrase = {
  locator: '//p[contains(@class, "-error") and contains(@id, "recoveryPhrase")]',
  method: 'xpath'
};

export const recoveryPhraseField = {
  locator: '//input[starts-with(@id, "downshift-") and contains(@id, "-input")]',
  method: 'xpath'
};

export const proceedRecoveryButton = {
  locator: 'primaryButton',
  method: 'id'
};

export const cleanRecoverInput = {
  locator: '.AutocompleteOverridesClassic_autocompleteWrapper input',
  method: 'css'
};

export const getWords = (word: string): LocatorObject => {
  return { locator: `//span[contains(text(), '${word}')]`, method: 'xpath' }
};

export const walletPasswordInput = { locator: "input[name='walletPassword']", method: 'css' };
export const repeatPasswordInput = { locator: "input[name='repeatPassword']", method: 'css' };
export const paperPasswordInput = { locator: "input[name='paperPassword']", method: 'css' };