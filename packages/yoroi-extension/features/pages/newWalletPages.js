// @flow

import type { LocatorObject } from '../support/webdriver';

export const connectHwButton: LocatorObject = { locator: '.WalletAdd_btnConnectHW', method: 'css' };
export const createWalletButton: LocatorObject = { locator: '.WalletAdd_btnCreateWallet', method: 'css' };
export const restoreWalletButton: LocatorObject = { locator: '.WalletAdd_btnRestoreWallet', method: 'css' };
// Currency options dialog
export const pickUpCurrencyDialog: LocatorObject = { locator: '.PickCurrencyOptionDialog', method: 'css' };
export const getCurrencyButton = (currency: string): LocatorObject => {
    return { locator: `.PickCurrencyOptionDialog_${currency}`, method: 'css' };
};
// HW options dialog
export const hwOptionsDialog: LocatorObject = { locator: '.WalletConnectHWOptionDialog', method: 'css' };
export const ledgerWalletButton: LocatorObject = { locator: '.WalletConnectHWOptionDialog_connectLedger', method: 'css' };
export const trezorWalletButton: LocatorObject = { locator: '.WalletConnectHWOptionDialog_connectTrezor', method: 'css' };
// Era options dialog
export const eraOptionsDialog: LocatorObject = { locator: '.WalletEraOptionDialog', method: 'css' };
export const shelleyEraButton: LocatorObject = { locator: '.WalletEraOptionDialog_bgShelleyMainnet', method: 'css' };
export const byronEraButton: LocatorObject = { locator: '.WalletEraOptionDialog_bgByronMainnet', method: 'css' };
// Trezor connect dialog
export const trezorConnectDialog: LocatorObject = { locator: '.CheckDialog', method: 'css' };
export const trezorWalletName: LocatorObject = { locator: '//input[@name="walletName"]', method: 'xpath' };
export const trezorConfirmButton: LocatorObject = { locator: '.MuiButton-primary', method: 'css' };

// Common elements
export const walletNameInput: LocatorObject = { locator: '//input[@name="walletName"]', method: 'xpath' };
export const saveDialog: LocatorObject = { locator: '.SaveDialog', method: 'css' };
export const saveButton: LocatorObject = { locator: '//button[@id="primaryButton"]', method: 'xpath' };