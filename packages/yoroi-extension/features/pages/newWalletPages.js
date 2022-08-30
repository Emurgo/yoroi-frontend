// @flow

import type { LocatorObject } from '../support/webdriver';

export const connectHwButton: LocatorObject = { locator: '.WalletAdd_btnConnectHW', method: 'css' };
export const createWalletButton: LocatorObject = {
  locator: '.WalletAdd_btnCreateWallet',
  method: 'css',
};
export const walletAddRestoreWalletButton: LocatorObject = {
  locator: '.WalletAdd_btnRestoreWallet',
  method: 'css',
};
// Currency options dialog
export const pickUpCurrencyDialog: LocatorObject = {
  locator: '.PickCurrencyOptionDialog',
  method: 'css',
};
export const pickUpCurrencyDialogErgo: LocatorObject = {
  locator: '.PickCurrencyOptionDialog_ergo',
  method: 'css',
};
export const pickUpCurrencyDialogCardano: LocatorObject = {
  locator: '.PickCurrencyOptionDialog_cardano',
  method: 'css',
};
export const walletRestoreOptionDialog: LocatorObject = {
  locator: '.WalletRestoreOptionDialog',
  method: 'css',
};
export const restoreNormalWallet: LocatorObject = {
  locator: '.WalletRestoreOptionDialog_restoreNormalWallet',
  method: 'css',
};
export const restore24WordWallet: LocatorObject = {
  locator: '.WalletRestoreOptionDialog_normal24WordWallet',
  method: 'css',
};
export const walletRestoreDialog: LocatorObject = {
  locator: '.WalletRestoreDialog',
  method: 'css',
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
export const createOptionDialog: LocatorObject = {
  locator: '.WalletCreateOptionDialog',
  method: 'css',
};
export const createPaperWalletButton: LocatorObject = {
  locator: '.WalletCreateOptionDialog_restorePaperWallet',
  method: 'css',
};
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
export const createWalletPasswordHelperText: LocatorObject = {
  locator: '//p[starts-with(@id, "walletPassword") and contains(@id, "-helper-text")]',
  method: 'xpath',
};
export const walletRecoveryPhraseMnemonicComponent: LocatorObject = {
  locator: '.WalletRecoveryPhraseMnemonic_component',
  method: 'css',
};
export const createWalletNameError: LocatorObject = {
  locator: '.walletName .MuiFormHelperText-root',
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

// Paper Wallet dialog
export const paperWalletDialogSelect: LocatorObject = {
  locator: '.WalletPaperDialog_component .MuiSelect-select',
  method: 'css',
};
export const restorePaperWalletButton: LocatorObject = {
  locator: '.WalletRestoreOptionDialog_restorePaperWallet',
  method: 'css',
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
