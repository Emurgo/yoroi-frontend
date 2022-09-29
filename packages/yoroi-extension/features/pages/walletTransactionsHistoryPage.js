// @flow

import type { LocatorObject } from '../support/webdriver';
import { getMethod } from '../support/helpers/helpers';

export const walletSummaryBox: LocatorObject = { locator: 'walletSummary_box', method: 'id' };
export const transactionComponent: LocatorObject = {
  locator: '.Transaction_component',
  method: 'css',
};
export const transactionStatus: LocatorObject = { locator: '.Transaction_status', method: 'css' };

export const getTopTx = async (customWorld: any): Promise<webdriver$WebElement> => {
  const actualTxsList = await customWorld.getElementsBy(transactionComponent);
  return actualTxsList[0];
};

export const getTxStatus = async (tx: webdriver$WebElement): Promise<string> => {
  const statusElement = await tx.findElement(
    getMethod(transactionStatus.method)(transactionStatus.locator)
  );
  return await statusElement.getText();
};
