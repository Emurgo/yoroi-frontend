// @flow

import { truncateToken } from '../../app/utils/formatters';
import { By } from 'selenium-webdriver';
import type { LocatorObject } from '../support/webdriver';

type AmountItem = {|
  tokenName: string,
  amount: string,
|};

// Modern theme. Old UI
export const sendInputDialogFeesText: LocatorObject = {
  locator: '//div[@class="WalletSendForm_amountInput"]/div/p',
  method: 'xpath'
};

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
export const memoDialogComponent: LocatorObject = {
  locator: '.MemoDialogCommon_component',
  method: 'css',
};
export const memoContentText: LocatorObject = { locator: '.memoContent', method: 'css' };
export const getMemoText = async (customWorld: Object): Promise<string> => {
  const memoElem = await customWorld.getElementsBy(memoContentText);
  return await memoElem[0].getText();
};
export const memoContentInput: LocatorObject = {
  locator: '//input[starts-with(@name, "memo")]',
  method: 'xpath',
};
export const editMemoButton: LocatorObject = { locator: '.editMemoButton', method: 'css' };
export const deleteMemo = async (customWorld: Object, confirmDeleting: boolean = true) => {
  let memoComponent = await customWorld.findElement(memoDialogComponent);
  const deleteButton = await memoComponent.findElement(
    By.xpath('//button[@aria-label="delete memo"]')
  );
  await deleteButton.click();
  memoComponent = await customWorld.findElement(memoDialogComponent);
  if (confirmDeleting){
    const confirmDelete = await memoComponent.findElement(
      By.xpath('//button[contains(text(), "Delete")]')
    );
    await confirmDelete.click();
  } else {
    const confirmDelete = await memoComponent.findElement(
      By.xpath('//button[contains(text(), "Cancel")]')
    );
    await confirmDelete.click();
  }
}

export const nextButton: LocatorObject = {
  locator: '.WalletSendForm_component .MuiButton-primary',
  method: 'css',
};
export const invalidAddressError: LocatorObject = {
  locator: '//p[starts-with(@id, "receiver") and contains(@id, "-helper-text")]',
  method: 'xpath',
};

export const amountError: LocatorObject = {
  locator: '//p[starts-with(@id, "amount") and contains(@id, "-helper-text")]',
  method: 'xpath',
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
  locator: '.MuiButton-primary.Mui-disabled',
  method: 'css',
};

export const successPageTitle: LocatorObject = { locator: '.SuccessPage_title', method: 'css' };
export const transactionPageButton: LocatorObject = {
  locator: "//button[contains(text(), 'Transaction page')]",
  method: 'xpath',
};

// Send confirmation Dialog

export const getAmountItems = async (customWorld: any): Promise<Array<AmountItem>> => {
  const result = [];
  const amountElements = await customWorld.findElements(sendConfirmationDialogAmountText);
  for (const amountElement of amountElements) {
    const [elAmount, elToken] = (await amountElement.getText()).split(' ');
    result.push({
      tokenName: elToken.toLowerCase(),
      amount: elAmount,
    });
  }
  return result;
};

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
export const selectAssetDropDown: LocatorObject = {
  locator: '//div[starts-with(@id, "selectedToken--")]',
  method: 'xpath',
};
export const getTokenLocator = (tokenName: string): LocatorObject => {
  return { locator: truncateToken(tokenName), method: 'id' };
};
export const selectSendingAmountDropDown: LocatorObject = {
  locator: '//div[starts-with(@id, "selectedAmount--")]',
  method: 'xpath',
};
export const customAmountItem: LocatorObject = { locator: 'custom-amount', method: 'id' };
export const sendAllItem: LocatorObject = { locator: 'send-all', method: 'id' };
