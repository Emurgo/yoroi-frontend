// @flow

import type { LocatorObject } from '../support/webdriver';

export const feeField: LocatorObject = { locator: '.TransferSummaryPage_fees', method: 'css' };
export const amountField: LocatorObject = { locator: '.TransferSummaryPage_amount', method: 'css' };
export const totalAmountField: LocatorObject = {
  locator: '.TransferSummaryPage_totalAmount',
  method: 'css',
};
