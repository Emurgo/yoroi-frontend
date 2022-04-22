// @flow

import { By, WebElement } from 'selenium-webdriver';
import { getMethod } from '../support/helpers/helpers';
import type { LocatorObject } from '../support/webdriver';

export const noWalletsImg: LocatorObject = { locator: '.ConnectPage_noWalletsImage', method: 'css' };
export const createWalletBtn: LocatorObject = { locator: '.ConnectPage_createWallet', method: 'css' };
export const walletListElement: LocatorObject = { locator: '.ConnectPage_list', method: 'css' };
export const walletNameField: LocatorObject = { locator: 'div.WalletCard_name', method: 'css' };
export const walletItemButton: LocatorObject = { locator: './button', method: 'xpath' };
export const walletBalanceField: LocatorObject = { locator: '.WalletCard_balance', method: 'css' };
export const spendingPasswordInput: LocatorObject = {
  locator: '//input[@name="walletPassword"]',
  method: 'xpath',
};
export const spendingPasswordErrorField: LocatorObject = {
  locator: '//p[starts-with(@id, "walletPassword--") and contains(@id, "-helper-text")]',
  method: 'xpath',
};
export const eyeButton: LocatorObject = { locator: '.MuiIconButton-edgeEnd', method: 'css' };
export const confirmButton: LocatorObject = { locator: '.MuiButton-primary', method: 'css' };
export const backButton: LocatorObject = { locator: '.MuiButton-secondary', method: 'css' };

export const getWallets = async (customWorld: Object): Promise<Array<WebElement>> => {
  const walletList = await customWorld.waitForElement(walletListElement);
  return await walletList.findElements(By.css('li'));
};

export const getWalletName = async (wallets: Array<WebElement>, index: number): Promise<string> => {
  const walletNameFieldElem = await wallets[index].findElement(
    getMethod(walletNameField.method)(walletNameField.locator)
  );
  return await walletNameFieldElem.getText();
};

export const getWalletBalance = async (
  wallets: Array<WebElement>,
  index: number
): Promise<string> => {
  const walletBalanceElement = wallets[index].findElement(
    getMethod(walletBalanceField.method)(walletBalanceField.locator)
  );
  return await walletBalanceElement.getText();
};

export const selectWallet = async (wallets: Array<WebElement>, index: number) => {
  const walletButton = await wallets[index].findElement(
    getMethod(walletItemButton.method)(walletItemButton.locator)
  );
  await walletButton.click();
};
