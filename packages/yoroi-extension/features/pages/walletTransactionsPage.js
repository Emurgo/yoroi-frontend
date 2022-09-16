// @flow

import type { LocatorObject } from '../support/webdriver';
import { By } from 'selenium-webdriver';

export const getNotificationMessage = async (customWorld: any, translatedMessage: string) => {
  const messageParentElement = await customWorld.driver.findElement(
    By.xpath('//div[contains(@role, "tooltip")]')
  );
  return await messageParentElement.findElement(
    By.xpath(`//span[contains(text(), "${translatedMessage}")]`)
  );
}

export const parseTxInfo = async (addressList: Array<any>): Promise<Array<any>> => {
  const addressInfoRow = await addressList.findElements(By.css('.Transaction_addressItem'));

  const result = [];
  for (const row of addressInfoRow) {
    const rowInfo = await row.findElements(By.xpath('*'));
    const rowInfoText = await Promise.all(rowInfo.map(async column => await column.getText()));
    result.push(rowInfoText);
  }

  return result;
}

export const walletSummaryBox: LocatorObject = { locator: 'walletSummary_box', method: 'id' };
export const walletSummaryComponent: LocatorObject = {
  locator: '.WalletSummary_component',
  method: 'css',
};
export const copyToClipboardButton: LocatorObject = {
  locator: '.CopyableAddress_copyIconBig',
  method: 'css',
};
export const numberOfTransactions: LocatorObject = {
  locator: '.WalletSummary_numberOfTransactions',
  method: 'css',
};
export const noTransactionsComponent: LocatorObject = {
  locator: '.WalletNoTransactions_component',
  method: 'css',
};
export const showMoreButton: LocatorObject = {
  locator: '.WalletTransactionsList_component .MuiButton-primary',
  method: 'css',
};
export const transactionListElement: LocatorObject = {
  locator: '.Transaction_component',
  method: 'css',
};
export const pendingTransactionElement: LocatorObject = {
  locator: '.Transaction_pendingLabel',
  method: 'css',
};
export const failedTransactionElement: LocatorObject = {
  locator: '.Transaction_failedLabel',
  method: 'css',
};
export const transactionAddressListElement: LocatorObject = {
  locator: '.Transaction_addressList',
  method: 'css',
};
