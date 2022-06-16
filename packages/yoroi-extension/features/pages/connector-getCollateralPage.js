// @flow

import type { LocatorObject } from '../support/webdriver';

export const addCollateralTitle: LocatorObject = {
  locator: '//h5[contains(text(), "Add Collateral")]',
  method: 'xpath',
};

export const transactionFeeTitle: LocatorObject = {
  locator: '//p[contains(text(), "Transaction Fee")]',
  method: 'xpath',
};

export const totalAmountTitle: LocatorObject = {
  locator: '//p[contains(text(), "Total Amount")]',
  method: 'xpath',
};

export const getCollateralFee = async (customWorld: Object): Promise<string> => {
  const titleElement = await customWorld.findElement(transactionFeeTitle);
  const parentElement = await titleElement.findElement(By.xpath('./..'));
  const amountFieldElement = (await parentElement.findElements(By.xpath('./p')))[1];
  return (await amountFieldElement.getText()).split(' ')[0];
};

export const getCollateralTotalAmount = async (customWorld: Object): Promise<string> => {
  const titleElement = await customWorld.findElement(totalAmountTitle);
  const parentElement = await titleElement.findElement(By.xpath('./..'));
  const amountFieldElement = await parentElement.findElements(By.xpath('./h3'));
  return (await amountFieldElement.getText()).split(' ')[0];
};
