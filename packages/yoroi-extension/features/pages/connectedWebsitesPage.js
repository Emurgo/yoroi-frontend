// @flow
import { WebElement } from 'selenium-webdriver';
import { getMethod } from '../support/helpers/helpers';
import type { LocatorObject } from '../support/webdriver';

type WalletWithConnectedWebsite = {|
  walletTitle: string,
  walletType: string,
  amount: string,
  currency: string,
  websiteTitle: string,
  connectionStatus: string,
|};

const walletComponent: LocatorObject = { locator: '.WalletRow_component', method: 'css' };
const walletNameComponent: LocatorObject = { locator: '.WalletRow_name', method: 'css' };
const walletRowBalanceField: LocatorObject = { locator: '.WalletRow_balance', method: 'css' };
const websiteTitleField: LocatorObject = { locator: '.WalletRow_url', method: 'css' };
const connectionStatusField: LocatorObject = { locator: '.WalletRow_status', method: 'css' };
const disconnectButtonComponent: LocatorObject = { locator: '.WalletRow_delete', method: 'css' };
const disconnectButton: LocatorObject = {
  locator: '//div[@class="WalletRow_delete"]/button',
  method: 'xpath',
};

const getWalletListElements = async (customWorld: Object): Promise<Array<WebElement>> => {
  return await customWorld.findElements(walletComponent);
};

const getWalletName = async (
  walletRowElement: WebElement
): Promise<{| title: string, type: string |}> => {
  const nameComponent = await walletRowElement.findElement(
    getMethod(walletNameComponent.method)(walletNameComponent.locator)
  );
  const nameComponentText = await nameComponent.getText();
  const nameAndType = nameComponentText.split(' · ');
  return { title: nameAndType[0], type: nameAndType[1] };
};

const getAmountAndCurrency = async (
  walletRowElement: WebElement
): Promise<{| amount: string, currency: string |}> => {
  const totalComponent = await walletRowElement.findElement(
    getMethod(walletRowBalanceField.method)(walletRowBalanceField.locator)
  );
  const totalText = (await totalComponent.getText()).split(' ');
  return { amount: totalText[0], currency: totalText[1] };
};

const getWebsiteTitle = async (walletRowElement: WebElement): Promise<string> => {
  const websiteTitleComponent = await walletRowElement.findElement(
    getMethod(websiteTitleField.method)(websiteTitleField.locator)
  );
  return await websiteTitleComponent.getText();
};

const getConnectionStatus = async (walletRowElement: WebElement): Promise<string> => {
  const connectionStateComponent = await walletRowElement.findElement(
    getMethod(connectionStatusField.method)(connectionStatusField.locator)
  );
  return await connectionStateComponent.getText();
};

const getWalletConnectedTo = async (
  customWorld: Object,
  walletTitle: string,
  websiteTitle: string
): Promise<WebElement> => {
  const allWalletsRows = await getWalletListElements(customWorld);
  const result = allWalletsRows.filter(
    async walletRowElement =>
      (await getWalletName(walletRowElement)).title === walletTitle &&
      (await getWebsiteTitle(walletRowElement)) === websiteTitle
  );

  if (result.length === 0) {
    throw new Error(
      `There is no suitable wallet for the wallet title "${walletTitle}" and website URL "${websiteTitle}"`
    );
  } else if (result.length > 1) {
    throw new Error(
      `There are too many results for the wallet title "${walletTitle}" and website URL "${websiteTitle}"`
    );
  }
  return result[0];
};

export const getWalletsWithConnectedWebsites = async (
  customWorld: Object
): Promise<Array<WalletWithConnectedWebsite>> => {
  const result: Array<WalletWithConnectedWebsite> = [];
  const walletRowElements = await getWalletListElements(customWorld);
  for (const walletRowElement of walletRowElements) {
    const walletName = await getWalletName(walletRowElement);
    const walletAmountAndCurrency = await getAmountAndCurrency(walletRowElement);
    const websiteTitle = await getWebsiteTitle(walletRowElement);
    const connectionStatus = await getConnectionStatus(walletRowElement);
    result.push({
      walletTitle: walletName.title,
      walletType: walletName.type,
      amount: walletAmountAndCurrency.amount,
      currency: walletAmountAndCurrency.currency,
      websiteTitle,
      connectionStatus,
    });
  }
  return result;
};

export const disconnectWallet = async (
  customWorld: Object,
  walletTitle: string,
  websiteTitle: string
): Promise<void> => {
  const walletRowElement = await getWalletConnectedTo(customWorld, walletTitle, websiteTitle);
  const walletRowDisconnectComponent = await walletRowElement.findElement(
    getMethod(disconnectButtonComponent.method)(disconnectButtonComponent.locator)
  );
  await customWorld.hoverOnElement(walletRowDisconnectComponent);
  const walletRowDisconnectButton = await walletRowElement.findElement(
    getMethod(disconnectButton.method)(disconnectButton.locator)
  );
  await walletRowDisconnectButton.click();
};
