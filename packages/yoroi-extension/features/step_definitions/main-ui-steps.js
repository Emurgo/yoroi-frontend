// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';
import { hiddenAmount } from '../../app/utils/strings';
import { truncateAddress } from '../../app/utils/formatters';
import {
  buyDialogAddress,
  navDetailsAmount,
  navDetailsBuyButton,
  navDetailsHideButton,
  navDetailsWalletDropdown,
  switchToWallet,
  transactionsTab,
} from '../pages/walletPage';
import { amountInput, receiverInput } from '../pages/walletSendPage';
import { walletButtonClassic } from '../pages/sidebarPage';
import {
  copyToClipboardButton,
  getNotificationMessage,
  walletSummaryComponent,
} from '../pages/walletTransactionsHistoryPage';
import { maintenanceBody, serverErrorBanner } from '../pages/mainWindowPage';
import { getRewardValue, getTotalAdaValue } from '../pages/dashboardPage';

Then(/^I should see the balance number "([^"]*)"$/, async function (number) {
  await this.waitUntilText(navDetailsAmount, number);
});

Then(/^I should see the Total ADA is equal to "([^"]*)"$/, async function (expectedTotalAda) {
  const realTotalAda = await getTotalAdaValue(this);
  expect(parseFloat(expectedTotalAda), `The Total ADA is different from the expected`).to.be.equal(realTotalAda);
})

Then(/^I should see the Reward is equal to "([^"]*)"$/, async function (expectedRewardAmount) {
  const realRewardAmount = await getRewardValue(this);
  expect(parseFloat(expectedRewardAmount), `The Total ADA is different from the expected`).to.be.equal(realRewardAmount);
})

Then(/^I should see send transaction screen$/, async function () {
  await this.waitForElement(receiverInput);
  await this.waitForElement(amountInput);
});

Then(/^I go to the transaction history screen$/, async function () {
  await this.click(transactionsTab);
});

When(/^I go to the main screen$/, async function () {
  await this.click(walletButtonClassic);
});

Then(/^I should see the transactions screen$/, async function () {
  await this.waitForElement(walletSummaryComponent);
});

Then(/^I click on "copy to clipboard" button$/, async function () {
  await this.click(copyToClipboardButton);
});

Then(/^I should see "copied" tooltip message:$/, async function (data) {
  const notification = data.hashes()[0];
  const notificationMessage = await this.intl(notification.message);
  const message = await getNotificationMessage(this, notificationMessage);
  expect(await message.isDisplayed()).to.be.true;
});

Then(/^I see transactions buttons are disabled$/, async function () {
  const disabledButtons = await this.driver.findElement(
    By.xpath("//button[contains(@class, 'confirmButton') and contains(@class, 'disabled')]")
  );
  const pageUrl = await this.driver.getCurrentUrl();
  disabledButtons.click();
  expect(pageUrl).to.be.equal(await this.driver.getCurrentUrl());
});

Then(/^I should see the networkError banner$/, async function () {
  await this.waitForElement(serverErrorBanner);
});

Then(/^I should see the serverError banner$/, async function () {
  await this.waitForElement(serverErrorBanner);
});

Then(/^I should see the app maintenance page$/, async function () {
  await this.waitForElement(maintenanceBody);
});

Then(/^I click on hide balance button$/, async function () {
  await this.click(navDetailsHideButton);
});

Then(/^I should see my balance hidden$/, async function () {
  await this.waitForElement(navDetailsAmount);
  await this.waitUntilContainsText(navDetailsAmount, hiddenAmount);
});

Then(/^I switch to "([^"]*)" from the dropdown$/, async function (walletName) {
  await switchToWallet(this, walletName);
});

Then(/^I select buy-sell from the dropdown$/, async function () {
  await this.click(navDetailsWalletDropdown);
  await this.click(navDetailsBuyButton);
});

Then(/^I should see the pre-filled address "([^"]*)"$/, async function (address) {
  await this.waitUntilContainsText(buyDialogAddress, truncateAddress(address));
});
