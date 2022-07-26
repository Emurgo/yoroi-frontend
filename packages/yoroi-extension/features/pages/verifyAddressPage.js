// @flow

import type { LocatorObject } from '../support/webdriver';

export const verifyButton: LocatorObject = { locator: '.VerifyAddressDialog .primary', method: 'css' };
export const addressField: LocatorObject = { locator: '.verificationAddress', method: 'css' };
export const derivationField: LocatorObject = { locator: '.VerifyAddressDialog_derivation', method: 'css' };