// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';
import { hiddenAmount } from '../../app/utils/strings';
import { truncateAddress, } from '../../app/utils/formatters';
import { getRewardValue, getTotalAdaValue } from '../pages/dashboardPage';

Then(/^I should see the balance number "([^"]*)"$/, async function (number) {
  await this.waitUntilText({ locator: '.NavWalletDetails_amount', method: 'css' }, number);
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
  await this.waitForElement({ locator: "input[name='receiver']", method: 'css' });
  await this.waitForElement({ locator: "input[name='amount']", method: 'css' });
});

Then(/^I go to the transaction history screen$/, async function () {
  await this.click({ locator: `//span[contains(text(), "Transactions")]`, method: 'xpath' });
});

When(/^I go to the main screen$/, async function () {
  await this.click({ locator: `//div[@class='Sidebar_categories']//button[1]`, method: 'xpath' });
});

Then(/^I should see the transactions screen$/, async function () {
  await this.waitForElement({ locator: "//div[@class='WalletSummary_component']", method: 'xpath' });
});

Then(/^I click on "copy to clipboard" button$/, async function () {
  await this.click({ locator: '.CopyableAddress_copyIconBig', method: 'css' });
});

Then(/^I should see "copied" tooltip message:$/, async function (data) {
  const notification = data.hashes()[0];
  const notificationMessage = await this.intl(notification.message);
  const messageParentElement = await this.driver.findElement(By.xpath('//div[contains(@role, "tooltip")]'));
  const message = await messageParentElement.findElement(By.xpath(`//span[contains(text(), "${notificationMessage}")]`));
  expect(await message.isDisplayed()).to.be.true;
});

Then(/^I see transactions buttons are disabled$/, async function () {
  const disabledButtons = await this.driver.findElement(By.xpath("//button[contains(@class, 'confirmButton') and contains(@class, 'disabled')]"));
  const pageUrl = await this.driver.getCurrentUrl();
  disabledButtons.click();
  expect(pageUrl).to.be.equal(await this.driver.getCurrentUrl());
});

Then(/^I should see the networkError banner$/, async function () {
  await this.waitForElement({ locator: '.ServerErrorBanner_serverError', method: 'css' });
});

Then(/^I should see the serverError banner$/, async function () {
  await this.waitForElement({ locator: '.ServerErrorBanner_serverError', method: 'css' });
});

Then(/^I should see the app maintenance page$/, async function () {
  await this.waitForElement({ locator: '.Maintenance_body', method: 'css' });
});

Then(/^I click on hide balance button$/, async function () {
  await this.click({ locator: '.NavWalletDetails_toggleButton', method: 'css' });
});

Then(/^I should see my balance hidden$/, async function () {
  await this.waitForElement({ locator: '.NavWalletDetails_amount', method: 'css' });
  await this.waitUntilContainsText({ locator: '.NavWalletDetails_amount', method: 'css' }, hiddenAmount);
});

Then(/^I switch to "([^"]*)" from the dropdown$/, async function (walletName) {
  await this.click({ locator: '.NavDropdown_toggle', method: 'css' });
  const wallets = await this.driver.findElements(By.xpath("//button[contains(@class, 'NavDropdownRow_head')]"));
  for (const wallet of wallets) {
    const nameElem = await wallet.findElement(By.css('.NavPlate_name'));
    const foundName = await nameElem.getText();
    if (walletName === foundName) {
      await wallet.click();
      return;
    }
  }
  throw new Error(`No wallet found with name ${walletName}`);
});

Then(/^I select buy-sell from the dropdown$/, async function () {
  await this.click({ locator: '.NavDropdown_toggle', method: 'css' });
  await this.click({ locator: '.NavDropdownContent_buyButton', method: 'css' });
});

Then(/^I should see the pre-filled address "([^"]*)"$/, async function (address) {
  await this.waitUntilContainsText({ locator: '.BuySellDialog_address', method: 'css' }, truncateAddress(address));
});
