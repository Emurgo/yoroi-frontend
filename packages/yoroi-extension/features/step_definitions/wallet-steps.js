// @flow

import { When, Then } from 'cucumber';
import { truncateLongName } from '../../app/utils/formatters';
import { walletNameInput } from '../pages/restoreWalletPage';
import { walletNameText } from '../pages/walletPage';

When(/^I enter the name "([^"]*)"$/, async function (walletName) {
  await this.input(walletNameInput, walletName);
});

When(/^I clear the name "([^"]*)"$/, async function (walletName) {
  await this.clearInputUpdatingForm(walletNameInput, walletName.length);
});

When(/^I navigate to wallet sidebar category$/, async function () {
  await this.click({ locator: `//div[@class='Sidebar_categories']//button[1]`, method: 'xpath' });
  await this.waitForElement(walletNameText);
});

Then(/^I should see the opened wallet with name "([^"]*)"$/, async function (walletName) {
  await this.waitUntilText(walletNameText, truncateLongName(walletName));
});

Then(/^I unselect the wallet$/, async function () {
  await this.click({ locator: '.NavBar_navbar .NavBar_title .NavBarBack_backButton', method: 'css' });
});

When(/^I am on the my wallets screen$/, async function () {
  await this.waitForElement({ locator: '.MyWallets_page', method: 'css' });
});
