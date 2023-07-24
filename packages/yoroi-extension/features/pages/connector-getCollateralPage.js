// @flow

import type { LocatorObject } from '../support/webdriver';

export const addCollateralTitle: LocatorObject = {
  locator: 'addCollateralTitle',
  method: 'id',
};

export const transactionFeeTitle: LocatorObject = {
  locator: 'addCollateralFeeTitle',
  method: 'id',
};

export const totalAmountTitle: LocatorObject = {
  locator: 'addCollateralAmountTitle',
  method: 'id',
};

export const getCollateralTransactionFee = async (customWorld: Object): Promise<string> => {
  const feeFieldElement = await customWorld.findElement(transactionFeeTitle);
  return (await feeFieldElement.getText()).split(' ')[0];
};

export const getCollateralTransactionAmount = async (customWorld: Object): Promise<string> => {
  const allAmountBlocks = await customWorld.findElement(totalAmountTitle);
  return (await allAmountBlocks.getText()).split(' ')[0];
};
