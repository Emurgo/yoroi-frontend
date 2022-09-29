// @flow

import { truncateToken } from '../../app/utils/formatters';
import type { LocatorObject } from '../support/webdriver';

export const selectAssetDropDown: LocatorObject = {
  locator: '//div[starts-with(@id, "selectedToken--")]',
  method: 'xpath',
};
export const getTokenLocator = (tokenName: string): LocatorObject => {
  return { locator: truncateToken(tokenName), method: 'id' };
};

export const selectSendingAmountDropDown: LocatorObject = {
  locator: '//div[starts-with(@id, "selectedAmount--")]',
  method: 'xpath',
};

export const customAmountItem: LocatorObject = { locator: 'custom-amount', method: 'id' };
export const sendAllItem: LocatorObject = { locator: 'send-all', method: 'id' };
