// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { truncateLongName, } from '../../app/utils/formatters';

When(/^I enter the name "([^"]*)"$/, async function (walletName) {
  await this.input("input[name='walletName']", walletName);
});

When(/^I clear the name "([^"]*)"$/, async function (walletName) {
  await this.clearInputUpdatingForm("input[name='walletName']", walletName.length);
});

When(/^I navigate to wallet transactions screen$/, async function () {
  await this.click(`//div[@class='Sidebar_categories']//button[1]`, By.xpath);
  await this.waitForElement('.NavPlate_name');
});

Then(/^I should see the opened wallet with name "([^"]*)"$/, async function (walletName) {
  await this.waitUntilText('.NavPlate_name', truncateLongName(walletName));
});

Then(/^I unselect the wallet$/, async function () {
  await this.click(`//div[@class='TopBarLayout_navbar']//button[@class='NavBarBack_backButton']`, By.xpath);
});

When(/^I am on the my wallets screen$/, async function () {
  await this.waitForElement('.MyWallets_page');
});
