// @flow

import type { LocatorObject } from '../support/webdriver';

export const seedPhrasePlaceholder =
  'Tap each word in the correct order to verify your recovery phrase';
export const connectHwButton: LocatorObject = {
  locator: 'connectHardwareWalletButton',
  method: 'id',
};
export const createWalletButton: LocatorObject = {
  locator: 'createWalletButton',
  method: 'id',
};
export const restoreWalletButton: LocatorObject = {
  locator: 'restoreWalletButton',
  method: 'id',
};
// Currency options dialog
export const pickUpCurrencyDialog: LocatorObject = {
  locator: 'connectHardwareWalletButton',
  method: 'id',
};
export const pickUpCurrencyDialogCardano: LocatorObject = {
  locator: '.PickCurrencyOptionDialog_cardano',
  method: 'css',
};
export const selectWalletTypeStepBox: LocatorObject = {
  locator: 'selectWalletTypeStepBox',
  method: 'id',
};
export const restoreNormalWallet: LocatorObject = {
  locator: 'fifteenWordsButton',
  method: 'id',
};
export const restore24WordWallet: LocatorObject = {
  locator: 'twentyfourWordsButton',
  method: 'id',
};
export const infoDialog: LocatorObject = {
  locator: 'walletRestorationInfoDialog',
  method: 'id',
};
export const getCurrencyButton = (currency: string): LocatorObject => {
  return { locator: `.PickCurrencyOptionDialog_${currency}`, method: 'css' };
};
// HW options dialog
export const hwOptionsDialog: LocatorObject = {
  locator: '.WalletConnectHWOptionDialog',
  method: 'css',
};
export const ledgerWalletButton: LocatorObject = {
  locator: '.WalletConnectHWOptionDialog_connectLedger',
  method: 'css',
};
export const trezorWalletButton: LocatorObject = {
  locator: '.WalletConnectHWOptionDialog_connectTrezor',
  method: 'css',
};
// Era options dialog
export const eraOptionsDialog: LocatorObject = { locator: '.WalletEraOptionDialog', method: 'css' };
export const shelleyEraButton: LocatorObject = {
  locator: '.WalletEraOptionDialog_bgShelleyMainnet',
  method: 'css',
};
export const byronEraButton: LocatorObject = {
  locator: '.WalletEraOptionDialog_bgByronMainnet',
  method: 'css',
};
// Trezor connect dialog
export const trezorConnectDialog: LocatorObject = { locator: '.CheckDialog', method: 'css' };
export const trezorWalletName: LocatorObject = {
  locator: '//input[@name="walletName"]',
  method: 'xpath',
};
export const trezorConfirmButton: LocatorObject = { locator: '.MuiButton-primary', method: 'css' };
// Create wallet dialog
export const createWalletPasswordInput: LocatorObject = {
  locator: '.WalletCreateDialog .walletPassword input',
  method: 'css',
};
export const createWalletRepeatPasswordInput: LocatorObject = {
  locator: '.WalletCreateDialog .repeatedPassword input',
  method: 'css',
};
export const createPersonalWalletButton: LocatorObject = {
  locator: '.WalletCreateDialog .primary',
  method: 'css',
};
export const walletRecoveryPhraseMnemonicComponent: LocatorObject = {
  locator: '.WalletRecoveryPhraseMnemonic_component',
  method: 'css',
};
export const createWalletPasswordError: LocatorObject = {
  locator: '.FormFieldOverridesClassic_error',
  method: 'css',
};
export const securityWarning: LocatorObject = {
  locator: '.MuiFormControlLabel-root',
  method: 'css',
};

// Recovery Phrase dialog
export const recoveryPhraseButton: LocatorObject = {
  locator: '.WalletRecoveryPhraseDisplayDialog .primary',
  method: 'css',
};
export const recoveryPhraseConfirmButton: LocatorObject = {
  locator: '//button[text()="Confirm"]',
  method: 'xpath',
};
export const clearButton: LocatorObject = {
  locator: "//button[contains(text(), 'Clear')]",
  method: 'xpath',
};
export const getRecoveryPhraseWord = (indexNumber: number): LocatorObject => {
  return {
    locator: `//div[@class='WalletRecoveryPhraseEntryDialog_words']//button[${indexNumber}]`,
    method: 'xpath',
  };
};

export const restoreDialogButton: LocatorObject = {
  locator: '.WalletRestoreDialog .primary',
  method: 'css',
};

export const recoveryPhraseDeleteIcon = {
  locator: `(//span[contains(text(), '×')])[1]`,
  method: 'xpath',
};

export const recoveryPhraseError: LocatorObject = {
  locator: '//p[starts-with(@id, "recoveryPhrase--")]',
  method: 'xpath',
};

// Common elements
export const walletNameInput: LocatorObject = {
  locator: '//input[@name="walletName"]',
  method: 'xpath',
};
export const saveDialog: LocatorObject = { locator: '.SaveDialog', method: 'css' };
export const saveButton: LocatorObject = {
  locator: '//button[@id="primaryButton"]',
  method: 'xpath',
};
export const checkDialog: LocatorObject = { locator: '.CheckDialog_component', method: 'css' };
export const sendConfirmationDialog: LocatorObject = {
  locator: '.HWSendConfirmationDialog_dialog',
  method: 'css',
};
export const walletAlreadyExistsComponent: LocatorObject = {
  locator: '.WalletAlreadyExistDialog_component',
  method: 'css',
};
