// @flow

import { Given, When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';
import { expect } from 'chai';
import {
  checkIfElementsInArrayAreUnique,
} from '../support/helpers/helpers';

Given(/^I go to the receive screen$/, async function () {
  await this.click('.receive');
});

When(/^I click on the Generate new address button$/, async function () {
  await this.click('.generateAddressButton');
});

When(/^I click on the Hide used addresses button$/, async function () {
  const hideUsedText =
  await i18n.formatMessage(this.driver, { id: 'wallet.receive.page.hideUsedLabel' });
  await this.click(`//button[contains(text(), "${hideUsedText}")]`, By.xpath);
});

When(/^I click on the Generate new address button ([0-9]+) times$/, async function (times) {
  for (let curr = 1; curr <= times; curr++) {
    await this.click('.generateAddressButton');
    await this.waitForElement(`.generatedAddress-${curr + 1} .WalletReceive_addressId`);
  }
});

Then(/^I should see my latest address "([^"]*)" at the top$/, async function (address) {
  await this.waitUntilText('.WalletReceive_hash', address);
});

Then(/^I see every generated address is unique$/, async function () {
  const addressesStringArray = [];
  const addresses = await this.driver.findElements(By.xpath("//div[@class='WalletReceive_addressId']"));

  for (let i = 1; i <= addresses.length; i++) {
    await this.driver.findElement(By.css(`.generatedAddress-${i} .WalletReceive_addressId`)).getText().then(addr => (
      addressesStringArray.push(addr)
    ));
  }
  const unique = await checkIfElementsInArrayAreUnique.call(this, addressesStringArray);
  expect(unique).to.be.true;
});

Then(/^I should see the addresses exactly list them$/, async function (table) {
  const rows = table.hashes();
  const waitUntilAddressesAppeared = rows.map((row, index) => (
    this.waitUntilText(
      `.generatedAddress-${index + 1} .WalletReceive_addressId`,
      row.address
    )
  ));
  const noMoreAddressAppeared = this.waitForElementNotPresent(
    `.generatedAddress-${rows.length + 1} .WalletReceive_addressId`
  );
  waitUntilAddressesAppeared.push(noMoreAddressAppeared);
  await Promise.all(waitUntilAddressesAppeared);
});

Then(/^I shouldn't see the address "([^"]*)"$/, async function (address) {
  await this.waitForElementNotPresent(`//div[contains(text(), "${address}")]`, By.xpath);
});

Then(/I should see an error about max unused addresses/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'api.errors.unusedAddressesError' });
  await this.waitUntilText('.WalletReceive_error', errorMessage);
});
