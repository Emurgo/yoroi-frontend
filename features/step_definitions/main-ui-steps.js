// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';

Then(/^I should see the balance number "([^"]*)"$/, async function (number) {
  await this.waitUntilText('.WalletTopbarTitle_walletAmount', number);
});

Then(/^I should see send transaction screen$/, async function () {
  await this.waitForElement("input[name='receiver']");
  await this.waitForElement("input[name='amount']");
});

Then(/^I go to the transaction history screen$/, async function () {
  await this.click(`//span[contains(text(), "Transactions")]`, By.xpath);
});

When(/^I go to the main screen$/, async function () {
  await this.click(`//header//button[1]`, By.xpath);
});

Then(/^I should see the transactions screen$/, async function () {
  await this.waitForElement("//div[@class='WalletSummary_numberOfTransactions']", By.xpath);
});

Then(/^I click on "copy to clipboard" button$/, async function () {
  await this.click('.CopyableAddress_copyIconBig');
});

Then(/^I should see "You have successfully copied wallet address" pop up:$/, async function (data) {
  const error = data.hashes()[0];
  const errorMessage = await this.intl(error.message);
  await this.waitForElement(`//div[@class='VerticalFlexContainer_component']//span[contains(text(), '${errorMessage}')]`, By.xpath);
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
  await this.click('.hideBalanceButton');
});

Then(/^I should see my balance hidden$/, async function () {
  await this.waitForElement('.WalletTopbarTitle_hiddenWalletAmount');
  await this.waitUntilContainsText('.WalletTopbarTitle_hiddenWalletAmount', '***');
});
