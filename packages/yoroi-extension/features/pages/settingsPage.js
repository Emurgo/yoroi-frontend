// @flow

import type { LocatorObject } from '../support/webdriver';

export const fullScreenMessage: LocatorObject = {
  locator: '.FullscreenMessage_title',
  method: 'css',
};

// Wallet tab

export const walletNameInputSelector: LocatorObject = {
  locator: '.SettingsLayout_settingsPane .walletName input',
  method: 'css',
};
export const walletNameInput: LocatorObject = {
  locator: '.SettingsLayout_settingsPane .InlineEditingInput_component',
  method: 'css',
};
export const walletSettingsPane: LocatorObject = {
  locator: '.SettingsLayout_settingsPane',
  method: 'css',
};
export const removeWalletButton: LocatorObject = { locator: '.removeWallet', method: 'css' };
export const resyncWalletButton: LocatorObject = { locator: '.resyncButton', method: 'css' };
export const exportButton: LocatorObject = { locator: '.exportWallet', method: 'css' };
export const exportPublicKeyDialog: LocatorObject = {
  locator: '.ExportPublicKeyDialog_component',
  method: 'css',
};

// Level of complexity tab

export const complexityLevelForm: LocatorObject = {
  locator: '.ComplexityLevelForm_cardsWrapper',
  method: 'css',
};
export const complexitySelected: LocatorObject = { locator: '.currentLevel', method: 'css' };

// General tab

export const languageSelector: LocatorObject = {
  locator: '//div[starts-with(@id, "languageId")]',
  method: 'xpath',
};
export const settingsLayoutComponent: LocatorObject = {
  locator: '.SettingsLayout_component',
  method: 'css',
};
export const secondThemeSelected: LocatorObject = {
  locator: '.ThemeSettingsBlock_themesWrapper button:nth-child(2).ThemeSettingsBlock_active',
  method: 'css',
};

// Change password dialog

export const currentPasswordInput: LocatorObject = {
  locator: '.changePasswordDialog .currentPassword input',
  method: 'css',
};
export const newPasswordInput: LocatorObject = {
  locator: '.changePasswordDialog .newPassword input',
  method: 'css',
};
export const repeatPasswordInput: LocatorObject = {
  locator: '.changePasswordDialog .repeatedPassword input',
  method: 'css',
};
export const confirmButton: LocatorObject = { locator: '.confirmButton', method: 'css' };
export const changePasswordDialog: LocatorObject = {
  locator: '.changePasswordDialog',
  method: 'css',
};
export const walletPasswordHelperText: LocatorObject = {
  locator: '//p[starts-with(@id, "walletPassword--") and contains(@id, "-helper-text")]',
  method: 'xpath',
};
export const helperText: LocatorObject = { locator: '.MuiFormHelperText-root', method: 'css' };
export const changePasswordDialogError: LocatorObject = {
  locator: '.ChangeWalletPasswordDialog_error',
  method: 'css',
};

// Support/Logs Tab

export const faqTitle: LocatorObject = {
  locator: "//h1[contains(text(), 'Frequently asked questions')]",
  method: 'xpath',
};
export const reportingAProblemTitle: LocatorObject = {
  locator: "//h1[contains(text(), 'Reporting a problem')]",
  method: 'xpath',
};
export const logsTitle: LocatorObject = {
  locator: "//h1[contains(text(), 'Logs')]",
  method: 'xpath',
};

// Blockchain Tab

export const explorerSettingsDropdown: LocatorObject = {
  locator: '.ExplorerSettings_component',
  method: 'css',
};
export const cardanoPaymentsURLTitle: LocatorObject = {
  locator: "//h2[contains(text(), 'Cardano Payment URLs')]",
  method: 'xpath',
};
export const currencyConversionText: LocatorObject = {
  locator: "//h2[contains(text(), 'Currency Conversion')]",
  method: 'xpath',
};
