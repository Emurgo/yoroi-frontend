// @flow

import type { LocatorObject } from '../support/webdriver';
import i18n from '../support/helpers/i18n-helpers';
import { By } from 'selenium-webdriver';

const getReceiveSubTabButton = (translatedText: string) => {
  return { locator: `//span[contains(text(), "${translatedText}")]`, method: 'xpath' };
}

export const getGeneratedAddress = (rowIndex: number): LocatorObject => {
  return {
    locator: `.generatedAddress-${rowIndex + 1} .RawHash_hash`,
    method: 'css',
  };
};

export const getAddress = (address: string): LocatorObject => {
  return {
    locator: `//div[contains(text(), "${address}")]`,
    method: 'xpath',
  };
};

export const getSubTabButton = (chain: string, kind: string): LocatorObject => {
  return { locator: `div.${chain}.${kind}.ReceiveNavButton_wrapper`, method: 'css' };
};

export const getAllAddressesButton = async (customWorld: any): Promise<LocatorObject> => {
  const translatedText = await i18n.formatMessage(customWorld.driver, {
    id: 'wallet.receive.navigation.allLabel',
  });
  return getReceiveSubTabButton(translatedText);
};

export const getUnusedAddressesButton = async (customWorld: any): Promise<LocatorObject> => {
  const translatedText = await i18n.formatMessage(customWorld.driver, {
    id: 'wallet.receive.navigation.unusedLabel',
  });
  return getReceiveSubTabButton(translatedText);
};

export const getUsedAddressesButton = async (customWorld: any): Promise<LocatorObject> => {
  const translatedText = await i18n.formatMessage(customWorld.driver, {
    id: 'wallet.receive.navigation.usedLabel',
  });
  return getReceiveSubTabButton(translatedText);
};

export const getHasBalanceButton = async (customWorld: any): Promise<LocatorObject> => {
  const translatedText = await i18n.formatMessage(customWorld.driver, {
    id: 'wallet.receive.navigation.hasBalanceLabel',
  });
  return getReceiveSubTabButton(translatedText);
};

export const getAddressFromAddressRow = async (row: any): Promise<string> => {
  const topAddrElem = await row.findElement(By.css(walletAddressLocator));
  return await topAddrElem.getText();
};

export const addressErrorPhrase: LocatorObject = {
  locator: '.StandardHeader_error',
  method: 'css',
};
export const generateAddressButton: LocatorObject = {
  locator: '.generateAddressButton',
  method: 'css',
};
export const addressBookTab: LocatorObject = { locator: `.addressBook`, method: 'css' };
export const rewardAddressTab: LocatorObject = { locator: `.reward`, method: 'css' };
export const yourWalletAddrHeader: LocatorObject = {
  locator: '.StandardHeader_copyableHash',
  method: 'css',
};
export const verifyAddressButton: LocatorObject = {
  locator: '.WalletReceive_verifyIcon',
  method: 'css',
};

export const walletAddressRow: LocatorObject = { locator: 'WalletReceive_walletAddress', method: 'css' };
export const walletAddressLocator = '.WalletReceive_addressHash';
export const verifyAddressHWButton: LocatorObject = {
  locator: '.VerifyAddressDialog_component .primary',
  method: 'css',
};
export const unmangleButton: LocatorObject = {
  locator: '.MangledHeader_submitButton ',
  method: 'css',
};

export const generateUriIcon: LocatorObject = {
  locator: '.WalletReceive_generateURIIcon',
  method: 'css',
};
export const uriGenerateDialog: LocatorObject = { locator: '.URIGenerateDialog', method: 'css' };
export const generateUriButton: LocatorObject = {
  locator: '.URIGenerateDialog_component .MuiButton-primary',
  method: 'css',
};
export const uriDisplayDialog: LocatorObject = { locator: '.URIDisplayDialog', method: 'css' };
export const copyToClipboardIcon: LocatorObject = {
  locator: '.URIDisplayDialog_uriDisplay .CopyableAddress_copyIconBig',
  method: 'css',
};
export const uriLandingDialog: LocatorObject = { locator: '.URILandingDialog', method: 'css' };
export const uriLandingDialogAcceptButton: LocatorObject = {
  locator: '.URILandingDialog .MuiButton-primary',
  method: 'css',
};

export const uriVerifyDialog: LocatorObject = { locator: '.URIVerifyDialog', method: 'css' };
export const uriVerifyDialogAddress: LocatorObject = {
  locator: '.URIVerifyDialog_address',
  method: 'css',
};
export const uriVerifyDialogAmount: LocatorObject = {
  locator: '.URIVerifyDialog_amount',
  method: 'css',
};
export const uriDetailsConfirmButton: LocatorObject = {
  locator: '.URIVerifyDialog .primary',
  method: 'css',
};
export const invalidUriDialog: LocatorObject = { locator: '.URIInvalidDialog', method: 'css' };
