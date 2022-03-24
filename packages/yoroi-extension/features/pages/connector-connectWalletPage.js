// @flow

import { By, WebElement } from 'selenium-webdriver';
import { getMethod } from '../support/helpers/helpers';

export const walletListElement = { locator: '.ConnectPage_list', method: 'css' };
export const walletNameField = { locator: 'div.WalletCard_name', method: 'css' };
export const walletItemButton = { locator: './button', method: 'xpath' };
export const walletBalanceField = { locator: '.WalletCard_balance', method: 'css' };
export const spendingPasswordField = { locator: '//input[@name="walletPassword"]', method: 'xpath' };
export const confirmButton = { locator: '.MuiButton-primary', method: 'css' };
export const backButton = { locator: '.MuiButton-secondary', method: 'css' };

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

// await (
//   await this.getElementBy({
//     locator: '//Button[text()="Connect"]',
//     method: 'xpath',
//   })
// ).click();
