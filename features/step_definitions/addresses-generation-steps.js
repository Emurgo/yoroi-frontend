// @flow

import { Given, When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';
import { expect } from 'chai';
import {
  checkIfElementsInArrayAreUnique,
} from '../support/helpers/helpers';
import { truncateAddress, truncateAddressShort } from '../../app/utils/formatters';

Given(/^I go to the receive screen$/, async function () {
  await this.click('.receive');
});

When(/^I click on the Generate new address button$/, async function () {
  await this.click('.generateAddressButton');
});

When(/^I click on the ([^ ]*) ([^ ]*) tab$/, async function (kind, chain) {
  await this.click(`div.${chain}.${kind}.ReceiveNavButton_wrapper`);
});

When(/^I click on the top-level address book tab$/, async function () {
  await this.click(`//div[contains(text(), "Address book") and contains(@class, "ReceiveNavButton_label")]`, By.xpath);
});

When(/^I click on the top-level reward address tab$/, async function () {
  await this.click(`//div[contains(text(), "Reward") and contains(@class, "ReceiveNavButton_label")]`, By.xpath);
});

When(/^I click on the All addresses button$/, async function () {
  const hideUsedText = await i18n.formatMessage(this.driver, { id: 'wallet.receive.navigation.allLabel' });
  await this.click(`//span[contains(text(), "${hideUsedText}")]`, By.xpath);
});
When(/^I click on the Unused addresses button$/, async function () {
  const hideUsedText = await i18n.formatMessage(this.driver, { id: 'wallet.receive.navigation.unusedLabel' });
  await this.click(`//span[contains(text(), "${hideUsedText}")]`, By.xpath);
});
When(/^I click on the Used addresses button$/, async function () {
  const hideUsedText = await i18n.formatMessage(this.driver, { id: 'wallet.receive.navigation.usedLabel' });
  await this.click(`//span[contains(text(), "${hideUsedText}")]`, By.xpath);
});
When(/^I click on the HasBalance addresses button$/, async function () {
  const hideUsedText = await i18n.formatMessage(this.driver, { id: 'wallet.receive.navigation.hasBalanceLabel' });
  await this.click(`//span[contains(text(), "${hideUsedText}")]`, By.xpath);
});

When(/^I click on the Generate new address button ([0-9]+) times$/, async function (times) {
  for (let curr = 1; curr <= times; curr++) {
    await this.click('.generateAddressButton');
    await this.waitForElement(`.generatedAddress-${curr + 1} .RawHash_hash`);
  }
});

Then(/^I should see my latest address "([^"]*)" at the top$/, async function (address) {
  await this.waitUntilText('.StandardHeader_copyableHash', truncateAddress(address));
});
Then(/^I should see at least ([^"]*) addresses$/, async function (numAddresses) {
  const rows = await this.driver.findElements(By.css('.WalletReceive_walletAddress'));
  expect(rows.length).be.at.least(Number.parseInt(numAddresses, 10));
});
Then(/^I should see ([^"]*) addresses with address "([^"]*)" at the top$/, async function (numAddresses, address) {
  const rows = await this.driver.findElements(By.css('.WalletReceive_walletAddress'));
  expect(rows.length).to.equal(Number.parseInt(numAddresses, 10));

  const topAddrElem = await rows[0].findElement(By.css('.WalletReceive_addressHash'));
  const topAddr = await topAddrElem.getText();
  expect(topAddr).to.equal(truncateAddressShort(address));
});

Then(/^I see every generated address is unique$/, async function () {
  const addresses = await this.driver.findElements(By.xpath("//div[@class='RawHash_hash']"));

  const addressesStringArray = Array
    .from({ length: addresses.length }, (x, i) => i + 1)
    .map(async i => (
      await this.driver
        .findElement(By.css(`.generatedAddress-${i} .RawHash_hash`))
        .getText()
    ));

  await Promise
    .all(addressesStringArray)
    .then(async completed => {
      const unique = checkIfElementsInArrayAreUnique.call(this, completed);
      expect(unique).to.be.true;
      return undefined;
    });
});

Then(/^I should see the addresses exactly list them$/, async function (table) {
  const rows = table.hashes();
  const waitUntilAddressesAppeared = rows.map((row, index) => (
    this.waitUntilText(
      `.generatedAddress-${index + 1} .RawHash_hash`,
      truncateAddressShort(row.address)
    )
  ));
  const noMoreAddressAppeared = this.waitForElementNotPresent(
    `.generatedAddress-${rows.length + 1} .RawHash_hash`
  );
  waitUntilAddressesAppeared.push(noMoreAddressAppeared);
  await Promise.all(waitUntilAddressesAppeared);
});

Then(/^I shouldn't see the address "([^"]*)"$/, async function (address) {
  await this.waitForElementNotPresent(`//div[contains(text(), "${truncateAddressShort(address)}")]`, By.xpath);
});

Then(/I should see an error about max unused addresses/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'api.errors.unusedAddressesError' });
  await this.waitUntilText('.StandardHeader_error', errorMessage);
});
