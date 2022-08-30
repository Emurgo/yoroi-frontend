// @flow
// Revamped sidebar's elements

import type { LocatorObject } from '../support/webdriver';

export const walletButton: LocatorObject = {
  locator: 'settings.menu.wallet.link.label',
  method: 'id',
};
export const stakingButton: LocatorObject = { locator: 'sidebar.staking', method: 'id' };
export const assetsButton: LocatorObject = { locator: 'sidebar.assets', method: 'id' };
export const votingButton: LocatorObject = { locator: 'sidebar.voting', method: 'id' };
export const settingsButton: LocatorObject = { locator: 'sidebar.settings', method: 'id' };
export const faqButton: LocatorObject = { locator: '.SidebarRevamp_faq', method: 'css' };

// Classic version elements

export const walletButtonClassic: LocatorObject = {
  locator: `//div[@class='Sidebar_categories']//button[1]`,
  method: 'xpath',
};
