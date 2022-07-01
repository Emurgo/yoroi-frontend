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
