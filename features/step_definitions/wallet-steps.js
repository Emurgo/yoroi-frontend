// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';

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
  await this.waitUntilText('.NavPlate_name', walletName);
});
