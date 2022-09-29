// @flow

import type { LocatorObject } from '../support/webdriver';

export const iframe: LocatorObject = {
  locator: '#classicCardanoStakingPage > iframe',
  method: 'css',
};
export const iframePoolIdInput: LocatorObject = { locator: '//div/form/input', method: 'xpath' };
export const iframePoolIdSearchButton: LocatorObject = {
  locator: '//div/form/button',
  method: 'xpath',
};
export const iframeFirstPoolDelegateButton: LocatorObject = {
  locator: '//table/tbody/tr/td/button',
  method: 'xpath',
};
