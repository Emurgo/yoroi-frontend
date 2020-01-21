// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';

Then(/^I should see the balance number "([^"]*)"$/, async function (number) {
  await this.waitUntilText('.NavWalletDetails_amount', number);
});

Then(/^I should see send transaction screen$/, async function () {
  await this.waitForElement("input[name='receiver']");
  await this.waitForElement("input[name='amount']");
});

Then(/^I go to the transaction history screen$/, async function () {
  await this.click(`//span[contains(text(), "Transactions")]`, By.xpath);
});

When(/^I go to the main screen$/, async function () {
  await this.click(`//div[@class='Sidebar_categories']//button[1]`, By.xpath);
});

Then(/^I should see the transactions screen$/, async function () {
  await this.waitForElement("//div[@class='WalletSummary_component']", By.xpath);
});

Then(/^I click on "copy to clipboard" button$/, async function () {
  await this.click('.CopyableAddress_copyIconBig');
});

Then(/^I should see "copied" tooltip message:$/, async function (data) {
  const notification = data.hashes()[0];
  const notificationMessage = await this.intl(notification.message);
  await this.waitForElement(`//div[@class='SimpleBubble_bubble'][contains(text(), '${notificationMessage}')]`, By.xpath);
});

Then(/^I see transactions buttons are disabled$/, async function () {
  const disabledButtons = await this.driver.findElement(By.xpath("//button[contains(@class, 'confirmButton') and contains(@class, 'disabled')]"));
  const pageUrl = await this.driver.getCurrentUrl();
  disabledButtons.click();
  expect(pageUrl).to.be.equal(await this.driver.getCurrentUrl());
});

Then(/^I should see the networkError banner$/, async function () {
  await this.waitForElement('.ServerErrorBanner_serverError');
});

Then(/^I should see the serverError banner$/, async function () {
  await this.waitForElement('.ServerErrorBanner_serverError');
});

Then(/^I click on hide balance button$/, async function () {
  await this.click('.NavWalletDetails_toggleButton');
});

Then(/^I should see my balance hidden$/, async function () {
  await this.waitForElement('.NavWalletDetails_amount');
  await this.waitUntilContainsText('.NavWalletDetails_amount', '***');
});
