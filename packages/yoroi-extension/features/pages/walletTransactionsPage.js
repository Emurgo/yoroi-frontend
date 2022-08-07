// @flow

import type { LocatorObject } from '../support/webdriver';
import { getMethod } from '../support/helpers/helpers';

export const walletSummaryBox: LocatorObject = { locator: 'walletSummary_box', method: 'id' };
export const txRowComponent: LocatorObject = { locator: '.Transaction_component', method: 'css' };
export const txStatus: LocatorObject = { locator: 'txStatus', method: 'id' };
export const txFee: LocatorObject = { locator: 'txFee', method: 'id' };
export const txAmount: LocatorObject = { locator: 'transactionAmount', method: 'id' };

export const getLastTx = async (customWorld: any) => {
    const allTxs = await customWorld.findElements(txRowComponent);
    return allTxs[0];
}

export const getLastTxStatus = async (customWorld: any): Promise<string> => {
    const lastTx = await getLastTx(customWorld);
    const statusElement = await lastTx.findElement(getMethod(txStatus.method)(txStatus.locator));
    return await statusElement.getText();
}

export const getLastTxFee = async (customWorld: any): Promise<string> => {
    const lastTx = await getLastTx(customWorld);
    const feeElement = await lastTx.findElement(getMethod(txFee.method)(txFee.locator));
    return await feeElement.getText();
}

export const getLastTxAmount = async (customWorld: any): Promise<string> => {
    const lastTx = await getLastTx(customWorld);
    const amountElement = await lastTx.findElement(getMethod(txAmount.method)(txAmount.locator));
    return await amountElement.getText();
}