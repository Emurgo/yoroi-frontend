// @flow

import type { LocatorObject } from '../support/webdriver';

export const generalSettingsComponent: LocatorObject = {
  locator: '.GeneralSettings_component',
  method: 'css',
};
export const coinPriceCurrency: LocatorObject = {
  locator: '//div[starts-with(@id, "coinPriceCurrencyId--")]',
  method: 'xpath',
};

export const amountDisplayFiat: LocatorObject = {
  locator: '.AmountDisplay_fiat',
  method: 'css',
};

export const amountDisplayADA: LocatorObject = {
    locator: '.AmountDisplay_amount',
    method: 'css',
  };