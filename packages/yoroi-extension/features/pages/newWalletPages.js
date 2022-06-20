// @flow

import type { LocatorObject } from '../support/webdriver';

export const connectHwButton: LocatorObject = { locator: '.WalletAdd_btnConnectHW', method: 'css' };
export const createWalletButton: LocatorObject = { locator: '.WalletAdd_btnCreateWallet', method: 'css' };
export const restoreWalletButton: LocatorObject = { locator: '.WalletAdd_btnRestoreWallet', method: 'css' };
export const pickUpCurrencyDialog: LocatorObject = { locator: '.PickCurrencyOptionDialog', method: 'css' };
export const getCurrencyButton: LocatorObject = (currency: string) => {
  return { locator: `.PickCurrencyOptionDialog_${currency}`, method: 'css' };
};
export const hwOptionsDialog: LocatorObject = { locator: '.WalletConnectHWOptionDialog', method: 'css' };
export const ledgerWalletButton: LocatorObject = { locator: '.WalletConnectHWOptionDialog_connectLedger', method: 'css' };
export const trezorWalletButton: LocatorObject = { locator: '.WalletConnectHWOptionDialog_connectTrezor', method: 'css' };
