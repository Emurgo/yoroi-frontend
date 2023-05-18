// @flow

import { By, WebElement } from 'selenium-webdriver';
import type { LocatorObject } from '../support/webdriver';
import { getMethod } from '../support/helpers/helpers';

type AddressWithAmount = {|
  address: string,
  amount: number,
|};

type AddressesWithAmount = {|
  fromAddresses: Array<AddressWithAmount>,
  toAddresses: Array<AddressWithAmount>,
|};

const detailsTabName = 'Details';
const utxosTabName = 'UTxOs';
const connectionTabName = 'Connection';

const getTabButton = (tabName: string) => `//div[@role="tablist"]/button/p[text()="${tabName}"]`;

export const transactionFeeText: LocatorObject = {
  locator: 'signTxAdditionalInfoPanelBox-fee',
  method: 'id',
};

export const summaryBox: LocatorObject = {
  locator: 'signTxMessagesSummaryBox',
  method: 'id',
};

export const transactionTotalAmountField: LocatorObject = {
  locator: 'signTxMessagesSummaryBox-total',
  method: 'id',
};

const amountTextField: LocatorObject = {
  locator: 'asseetValueDisplayBox',
  method: 'id',
};

const fromAddressYourInputs: LocatorObject = {
  locator: 'fromAddressesBox-yourInputs',
  method: 'id',
};

const fromAddressForeignInputs: LocatorObject = {
  locator: 'fromAddressesBox-foreignInputs',
  method: 'id',
};

const toAddressYourInputs: LocatorObject = {
  locator: 'toAddressesBox-yourOutputs',
  method: 'id',
};

const toAddressForeignInputs: LocatorObject = {
  locator: 'toAddressesBox-foreignOutputs',
  method: 'id',
};

const addressRowLocator: LocatorObject = {
  locator: 'addressRow',
  method: 'id',
};

const addressRowAddressInfo: LocatorObject = {
  locator: './div[@class="CopyableAddress_component"]',
  method: 'xpath',
}

const addressRowAmount: LocatorObject = {
  locator: 'addressRow-amount',
  method: 'id',
};

const getAddressesRows = async (addressPart: WebElement): Promise<Array<WebElement>> => {
  return await addressPart.findElements(
    getMethod(addressRowLocator.method)(addressRowLocator.locator)
  );
};

const getAddressFromRow = async (addressRow: WebElement): Promise<string> => {
  const addressElement = await addressRow.findElement(
    getMethod(addressRowAddressInfo.method)(addressRowAddressInfo.locator)
  );
  return await addressElement.getText();
};

// should be improved in case of several outputs
const getAmountFromRow = async (addressRow: WebElement): Promise<string> => {
  const amountElement = await addressRow.findElement(
    getMethod(addressRowAmount.method)(addressRowAmount.locator)
  );
  return (await amountElement.getText()).split(' ')[0];
};

const getAddresses = async (addressesPart: WebElement): Promise<Array<AddressWithAmount>> => {
  const result = [];
  const addressesRows = await getAddressesRows(addressesPart);
  for (const addressesRow of addressesRows) {
    const address = await getAddressFromRow(addressesRow);
    const amountString = await getAmountFromRow(addressesRow);
    const amount = parseFloat(amountString);
    result.push({
      address,
      amount,
    });
  }
  return result;
};

const getFromAddresses = async (customWorld: Object): Promise<Array<AddressWithAmount>> => {
  const result = [];
  if (await customWorld.checkIfExists(fromAddressYourInputs)) {
    const fromAddressesYourInputsBoxElem = await customWorld.findElement(fromAddressYourInputs);
    const fromAddressesYourArr = await getAddresses(fromAddressesYourInputsBoxElem);
    result.push(...fromAddressesYourArr);
  }
  if (await customWorld.checkIfExists(fromAddressForeignInputs)) {
    const fromAddressesForeignInputsBoxElem = await customWorld.findElement(
      fromAddressForeignInputs
    );
    const fromAddressesForeignArr = await getAddresses(fromAddressesForeignInputsBoxElem);
    result.push(...fromAddressesForeignArr);
  }

  return result;
};

const getToAddresses = async (customWorld): Promise<Array<AddressWithAmount>> => {
  const result = [];
  if (await customWorld.checkIfExists(toAddressYourInputs)) {
    const toAddressesYourInputsBoxElem = await customWorld.findElement(toAddressYourInputs);
    const toAddressesYourArr = await getAddresses(toAddressesYourInputsBoxElem);
    result.push(...toAddressesYourArr);
  }
  if (await customWorld.checkIfExists(toAddressForeignInputs)) {
    const toAddressesForeignInputsBoxElem = await customWorld.findElement(
      toAddressForeignInputs
    );
    const toAddressesForeignArr = await getAddresses(toAddressesForeignInputsBoxElem);
    result.push(...toAddressesForeignArr);
  }

  return result;
};

export const detailsTabButton: LocatorObject = {
  locator: getTabButton(detailsTabName),
  method: 'xpath',
};

export const utxosTabButton: LocatorObject = {
  locator: getTabButton(utxosTabName),
  method: 'xpath',
};

export const connectionTabButton: LocatorObject = {
  locator: getTabButton(connectionTabName),
  method: 'xpath',
};

export const walletBalanceField: LocatorObject = { locator: '.WalletCard_balance', method: 'css' };

export const getTransactionFee = async (customWorld: Object): Promise<string> => {
  const amountFieldElement = await customWorld.findElement(transactionFeeText);
  return (await amountFieldElement.getText()).split(' ')[0];
};

export const getTransactionSentAmount = async (customWorld: Object): Promise<string> => {
  const allAmountBlocks = await customWorld.findElements(amountTextField);
  return (await allAmountBlocks[0].getText()).split(' ')[0];
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
