// @flow

import { By, WebElement } from 'selenium-webdriver';
import type { LocatorObject } from '../support/webdriver';

const overview = 'Overview';
const utxoAddresses = 'UTXO addresses';
const getTabButton = (tabName: string) =>
  `//div[@role="tablist"]/button[contains(text(), "${tabName}")]`;

const transactionFeeTitle: LocatorObject = {
  locator: '//p[contains(text(), "Transaction Fee")]',
  method: 'xpath',
};

const transactionTotalAmountField: LocatorObject = {
  locator: '//p[contains(text(), "Total Amount")]',
  method: 'xpath',
};

const addressesPanel: LocatorObject = {
  locator: '//div[@role="tabpanel"][2]/div/div/div',
  method: 'xpath',
};

const getToAddressesPanel = async (customWorld: Object) => {
  return (await customWorld.findElements(addressesPanel))[1];
};

const getFromAddressesPanel = async (customWorld: Object) => {
  return (await customWorld.findElements(addressesPanel))[0];
};

const getAddressesRows = async (addressPart: WebElement) => {
  return await addressPart.findElements(By.xpath('./div[2]/div'));
};

const getAddressFromRow = async (addressRow: WebElement) => {
  const addressElement = await addressRow.findElement(
    By.xpath('./div[@class="CopyableAddress_component"]')
  );
  return await addressElement.getText();
};

const getAmountFromRow = async (addressRow: WebElement) => {
  const amountElement = await addressRow.findElement(By.xpath('./div[2]'));
  return (await amountElement.getText()).split(' ')[0];
};

const getAddresses = async (addressesPart: WebElement) => {
  const result = [];
  const fromAddressesRows = await getAddressesRows(addressesPart);
  for (const fromAddressesRow of fromAddressesRows) {
    const address = await getAddressFromRow(fromAddressesRow);
    const amountString = await getAmountFromRow(fromAddressesRow);
    const amount = parseFloat(amountString);
    result.push({
      address,
      amount,
    });
  }
  return result;
};

const getFromAddresses = async (customWorld: Object) => {
  const fromAddressesPart = await getFromAddressesPanel(customWorld);
  return await getAddresses(fromAddressesPart);
};

const getToAddresses = async (customWorld: Object) => {
  const toAddressesPart = await getToAddressesPanel(customWorld);
  return await getAddresses(toAddressesPart);
};

export const overviewTabButton: LocatorObject = {
  locator: getTabButton(overview),
  method: 'xpath',
};

export const utxoAddressesTabButton: LocatorObject = {
  locator: getTabButton(utxoAddresses),
  method: 'xpath',
};

export const walletBalanceField: LocatorObject = { locator: '.WalletCard_balance', method: 'css' };

export const getTransactionFee = async (customWorld: Object): Promise<string> => {
  const titleElement = await customWorld.findElement(transactionFeeTitle);
  const parentElement = await titleElement.findElement(By.xpath('./..'));
  const amountFieldElement = (await parentElement.findElements(By.xpath('./p')))[1];
  return (await amountFieldElement.getText()).split(' ')[0];
};

export const getTransactionAmount = async (customWorld: Object): Promise<string> => {
  const titleElement = await customWorld.findElement(transactionTotalAmountField);
  const parentElement = await titleElement.findElement(By.xpath('./..'));
  const amountFieldElement = await parentElement.findElement(By.xpath('./h3'));
  return (await amountFieldElement.getText()).split(' ')[0];
};

export const spendingPasswordInput: LocatorObject = {
  locator: '//input[@name="walletPassword"]',
  method: 'xpath',
};

export const confirmButton = { locator: '.MuiButton-primary', method: 'css' };
export const cancelButton = { locator: '.MuiButton-secondary', method: 'css' };

export const getUTXOAddresses = async (customWorld: Object) => {
  const fromAddresses = await getFromAddresses(customWorld);
  const toAddresses = await getToAddresses(customWorld);
  return {
    fromAddresses: [...fromAddresses],
    toAddresses: [...toAddresses],
  };
};
