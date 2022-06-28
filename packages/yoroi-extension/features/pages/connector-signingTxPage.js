// @flow

import { By, WebElement } from 'selenium-webdriver';
import type { LocatorObject } from '../support/webdriver';

type AddressWithAmount = {|
  address: string,
  amount: number,
|};

type AddressesWithAmount = {|
  fromAddresses: Array<AddressWithAmount>,
  toAddresses: Array<AddressWithAmount>,
|};

const overview = 'Overview';
const utxoAddresses = 'UTXO addresses';
const getTabButton = (tabName: string) =>
  `//div[@role="tablist"]/button[contains(text(), "${tabName}")]`;

export const transactionFeeTitle: LocatorObject = {
  locator: '//p[contains(text(), "Transaction Fee")]',
  method: 'xpath',
};

export const transactionTotalAmountField: LocatorObject = {
  locator: '//p[contains(text(), "Total Amount")]',
  method: 'xpath',
};

const addressesPanel: LocatorObject = {
  locator: '//div[@role="tabpanel"][2]/div/div/div',
  method: 'xpath',
};

const getToAddressesPanel = async (customWorld: Object): Promise<WebElement> => {
  return (await customWorld.findElements(addressesPanel))[1];
};

const getFromAddressesPanel = async (customWorld: Object): Promise<WebElement> => {
  return (await customWorld.findElements(addressesPanel))[0];
};

const getAddressesRows = async (addressPart: WebElement): Promise<Array<WebElement>> => {
  return await addressPart.findElements(By.xpath('./div[2]/div'));
};

const getAddressFromRow = async (addressRow: WebElement): Promise<string> => {
  const addressElement = await addressRow.findElement(
    By.xpath('./div[@class="CopyableAddress_component"]')
  );
  return await addressElement.getText();
};

// should be improved in case of several outputs
const getAmountFromRow = async (addressRow: WebElement): Promise<string> => {
  const amountElement = await addressRow.findElement(By.xpath('./div[2]'));
  return (await amountElement.getText()).split(' ')[0];
};

const getAddresses = async (addressesPart: WebElement): Promise<Array<AddressWithAmount>> => {
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

const getFromAddresses = async (customWorld: Object): Promise<Array<AddressWithAmount>> => {
  const fromAddressesPart = await getFromAddressesPanel(customWorld);
  return await getAddresses(fromAddressesPart);
};

const getToAddresses = async (customWorld: Object): Promise<Array<AddressWithAmount>> => {
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

export const confirmButton: LocatorObject = { locator: '.MuiButton-primary', method: 'css' };
export const cancelButton: LocatorObject = { locator: '.MuiButton-secondary', method: 'css' };

export const getUTXOAddresses = async (customWorld: Object): Promise<AddressesWithAmount> => {
  const fromAddresses = await getFromAddresses(customWorld);
  const toAddresses = await getToAddresses(customWorld);
  return {
    fromAddresses: [...fromAddresses],
    toAddresses: [...toAddresses],
  };
};
