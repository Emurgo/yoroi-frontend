// @flow

import { When, Then } from 'cucumber';
import { truncateLongName } from '../../app/utils/formatters';

When(/^I enter the name "([^"]*)"$/, async function (walletName) {
  await this.input({ locator: "input[name='walletName']", method: 'css' }, walletName);
});

When(/^I clear the name "([^"]*)"$/, async function (walletName) {
  await this.clearInputUpdatingForm({ locator: "input[name='walletName']", method: 'css' }, walletName.length);
});

When(/^I navigate to wallet sidebar category$/, async function () {
  await this.click({ locator: `//div[@class='Sidebar_categories']//button[1]`, method: 'xpath' });
  await this.waitForElement({ locator: '.NavPlate_name', method: 'css' });
});

Then(/^I should see the opened wallet with name "([^"]*)"$/, async function (walletName) {
  await this.waitUntilText({ locator: '.NavPlate_name', method: 'css' }, truncateLongName(walletName));
});

Then(/^I unselect the wallet$/, async function () {
  await this.click({ locator: '.NavBar_navbar .NavBar_title .NavBarBack_backButton', method: 'css' });
});

When(/^I am on the my wallets screen$/, async function () {
  await this.waitForElement({ locator: '.MyWallets_page', method: 'css' });
});
