// @flow

import type { LocatorObject } from '../support/webdriver';

export const withdrawButton: LocatorObject = { locator: '.withdrawButton', method: 'css' };
export const rechartBar: LocatorObject = { locator: '.recharts-bar', method: 'css' };

export const mangledWarningIcon: LocatorObject = {
  locator: '.UserSummary_mangledWarningIcon',
  method: 'css',
};
export const userSummaryLink: LocatorObject = { locator: '.UserSummary_link', method: 'css' };
