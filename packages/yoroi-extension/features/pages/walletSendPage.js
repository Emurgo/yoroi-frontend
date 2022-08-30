// @flow

import type { LocatorObject } from '../support/webdriver';

export const assetSelector: LocatorObject = {
  locator: '.WalletSendForm_component .SimpleInput_input',
  method: 'css',
};
export const assetListElement: LocatorObject = {
  locator: '.TokenOptionRow_item_name',
  method: 'css',
};
export const receiverInput: LocatorObject = { locator: "input[name='receiver']", method: 'css' };
export const amountInput: LocatorObject = { locator: "input[name='amount']", method: 'css' };
export const addMemoButton: LocatorObject = { locator: '.addMemoButton', method: 'css' };
export const memoContentInput: LocatorObject = {
  locator: "input[name='memoContent']",
  method: 'css',
};
export const nextButton: LocatorObject = {
  locator: '.WalletSendForm_component .MuiButton-primary',
  method: 'css',
};
export const invalidAddressError: LocatorObject = {
  locator: '.receiver .SimpleInput_errored',
  method: 'css',
};
export const notEnoughAdaError: LocatorObject = {
  locator: '.FormFieldOverridesClassic_error',
  method: 'css',
};

export const sendAllCheckbox: LocatorObject = {
  locator: '.WalletSendForm_checkbox',
  method: 'css',
};
export const sendMoneyConfirmationDialog: LocatorObject = {
  locator: '.WalletSendConfirmationDialog_dialog',
  method: 'css',
};
export const submitButton: LocatorObject = { locator: '.confirmButton', method: 'css' };
export const disabledSubmitButton: LocatorObject = {
  locator: '.primary.SimpleButton_disabled',
  method: 'css',
};

export const successPageTitle: LocatorObject = { locator: '.SuccessPage_title', method: 'css' };
export const transactionPageButton: LocatorObject = {
  locator: "//button[contains(text(), 'Transaction page')]",
  method: 'xpath',
};

// Send confirmation Dialog

export const sendConfirmationDialogAddressToText: LocatorObject = {
  locator: '.WalletSendConfirmationDialog_addressTo',
  method: 'css',
};
export const sendConfirmationDialogFeesText: LocatorObject = {
  locator: '.WalletSendConfirmationDialog_fees',
  method: 'css',
};
export const sendConfirmationDialogAmountText: LocatorObject = {
  locator: '.WalletSendConfirmationDialog_amount',
  method: 'css',
};
export const sendConfirmationDialogTotalAmountText: LocatorObject = {
  locator: '.WalletSendConfirmationDialog_totalAmount',
  method: 'css',
};
export const sendConfirmationDialogError: LocatorObject = {
  locator: '.WalletSendConfirmationDialog_error',
  method: 'css',
};
export const warningBox: LocatorObject = { locator: '.WarningBox_warning', method: 'css' };
