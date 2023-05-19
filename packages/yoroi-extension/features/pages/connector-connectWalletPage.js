// @flow

import { By, WebElement } from 'selenium-webdriver';
import { getMethod } from '../support/helpers/helpers';
import type { LocatorObject } from '../support/webdriver';

export const logoElement: LocatorObject = { locator: '.Layout_logo', method: 'css' };
export const noWalletsImg: LocatorObject = {
  locator: '.ConnectPage_noWalletsImage',
  method: 'css',
};
export const createWalletBtn: LocatorObject = {
  locator: '.ConnectPage_createWallet',
  method: 'css',
};
export const walletListElement: LocatorObject = { locator: '.ConnectPage_list', method: 'css' };
export const walletNameField: LocatorObject = {
  locator: 'div.ConnectedWallet_nameWrapper',
  method: 'css',
};
export const walletItemButton: LocatorObject = { locator: './button', method: 'xpath' };
export const walletBalanceField: LocatorObject = { locator: '.WalletCard_balance', method: 'css' };
export const spendingPasswordInput: LocatorObject = {
  locator: 'walletPassword',
  method: 'id',
};
export const spendingPasswordErrorField: LocatorObject = {
  locator: 'walletPassword-helper-text',
  method: 'id',
};
export const eyeButton: LocatorObject = { locator: '.MuiIconButton-edgeEnd', method: 'css' };
export const confirmButton: LocatorObject = { locator: 'confirmButton', method: 'id' };
export const backButton: LocatorObject = { locator: 'backButton', method: 'id' };

export const getWallets = async (customWorld: Object): Promise<Array<WebElement>> => {
  const walletList = await customWorld.waitForElement(walletListElement);
  return await walletList.findElements(By.css('li'));
};

export const getWalletNameAndPlate = async (
  wallets: Array<WebElement>,
  index: number
): Promise<{| walletName: string, walletPlate: string |}> => {
  const walletNameFieldElem = await wallets[index].findElement(
    getMethod(walletNameField.method)(walletNameField.locator)
  );
  const fullText = await walletNameFieldElem.getText();
  const [name, walletPlate] = fullText.split('\n')
  return { walletName: name, walletPlate };
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
