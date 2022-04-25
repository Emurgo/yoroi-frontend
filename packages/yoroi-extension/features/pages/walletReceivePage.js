// @flow

import type { LocatorObject } from '../support/webdriver';

export const getGeneratedAddressLocator = (rowIndex: number): LocatorObject => {
  return {
    locator: `.generatedAddress-${rowIndex + 1} .RawHash_hash`,
    method: 'css'
  };
};

export const getAddressLocator = (address: string): LocatorObject => {
  return {
    locator: `//div[contains(text(), "${address}")]`,
    method: 'xpath'
  };
}

export const addressErrorPhrase = { locator: '.StandardHeader_error', method: 'css' };
export const generateAddressButton = { locator: '.generateAddressButton', method: 'css' };