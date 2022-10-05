// @flow
// Revamped wallets list elements

import type { LocatorObject } from '../support/webdriver';
import { By } from 'selenium-webdriver';

export const summaryTab: LocatorObject = { locator: 'summary', method: 'css' };
export const sendTab: LocatorObject = { locator: '.send', method: 'css' };
export const receiveTab: LocatorObject = { locator: '.receive', method: 'css' };
export const claimTransferTab: LocatorObject = { locator: '.claimTransfer', method: 'css' };
export const votingTab: LocatorObject = { locator: '.voting', method: 'css' };
export const delegationByIdTab: LocatorObject = { locator: '.cardanoStake', method: 'css' };

export const walletPlate: LocatorObject = { locator: '.NavPlate_plate', method: 'css' };
export const walletNameText: LocatorObject = { locator: '.NavPlate_name', method: 'css' };
export const activeNavTab: LocatorObject = { locator: '.WalletNavButton_active', method: 'css' };
export const dashboardTab: LocatorObject = { locator: '.stakeDashboard ', method: 'css' };
export const transactionsTab: LocatorObject = {
  locator: `//span[contains(text(), "Transactions")]`,
  method: 'xpath',
};

export const navDetailsAmount: LocatorObject = {
  locator: '.NavWalletDetails_amount',
  method: 'css',
};
export const navDetailsHideButton: LocatorObject = {
  locator: '.NavWalletDetails_toggleButton',
  method: 'css',
};
export const navDetailsWalletDropdown: LocatorObject = {
  locator: '.NavDropdown_toggle',
  method: 'css',
};

export const navDetailsWalletDropdownRow: LocatorObject = {
  locator: '//button[contains(@class, "NavDropdownRow_head")]',
  method: 'xpath'
};

export const switchToWallet = async (customWorld: Object, seekWalletName: string) => {
  await customWorld.click(navDetailsWalletDropdown);
  const wallets = await customWorld.findElements(navDetailsWalletDropdownRow);
  for (const wallet of wallets) {
    const nameElem = await wallet.findElement(By.css('.NavPlate_name'));
    const foundName = await nameElem.getText();
    if (foundName === seekWalletName) {
      await wallet.click();
      return;
    }
  }
  throw new Error(`No wallet found with name ${seekWalletName}`);
}

export const navDetailsBuyButton: LocatorObject = {
  locator: '.NavDropdownContent_buyButton',
  method: 'css',
};
export const buyDialogAddress: LocatorObject = { locator: '.BuySellDialog_address', method: 'css' };
export const addAdditionalWalletButton: LocatorObject = {
  locator: `.NavBar_navbar .NavBar_content .MuiButton-primary`,
  method: 'css',
};

export const walletNavBackButton: LocatorObject = {
  locator: '.NavBar_navbar .NavBar_title .NavBarBack_backButton',
  method: 'css',
};
