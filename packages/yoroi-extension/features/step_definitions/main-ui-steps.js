// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';
import { hiddenAmount } from '../../app/utils/strings';
import { truncateAddress, } from '../../app/utils/formatters';

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
  await this.waitForElement('.ServerErrorBanner_serverError');
});

Then(/^I should see the serverError banner$/, async function () {
  await this.waitForElement('.ServerErrorBanner_serverError');
});

Then(/^I should see the app maintenance page$/, async function () {
  await this.waitForElement('.Maintenance_body');
});

Then(/^I click on hide balance button$/, async function () {
  await this.click('.NavWalletDetails_toggleButton');
});

Then(/^I should see my balance hidden$/, async function () {
  await this.waitForElement('.NavWalletDetails_amount');
  await this.waitUntilContainsText('.NavWalletDetails_amount', hiddenAmount);
});

Then(/^I switch to "([^"]*)" from the dropdown$/, async function (walletName) {
  await this.click('.NavDropdown_toggle');
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
  await this.click('.NavDropdown_toggle');
  await this.click('.NavDropdownContent_buyButton');
});

Then(/^I should see the pre-filled address "([^"]*)"$/, async function (address) {
  await this.waitUntilContainsText('.BuySellDialog_address', truncateAddress(address));
});
