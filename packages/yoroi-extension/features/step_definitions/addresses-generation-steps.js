// @flow

import { Given, When, Then } from 'cucumber';
import i18n from '../support/helpers/i18n-helpers';
import { expect } from 'chai';
import { checkIfElementsInArrayAreUnique } from '../support/helpers/helpers';
import { truncateAddress, truncateAddressShort } from '../../app/utils/formatters';
import { receiveTab } from '../pages/walletPage';
import {
  addressErrorPhrase,
  generateAddressButton,
  getAddress,
  getGeneratedAddress,
  getSubTabButton,
  addressBookTab,
  rewardAddressTab,
  yourWalletAddrHeader,
  getAllAddressesButton,
  getUnusedAddressesButton,
  getUsedAddressesButton,
  getHasBalanceButton,
  walletAddressRow,
  getAddressFromAddressRow,
} from '../pages/walletReceivePage';

Given(/^Revamp. I go to the receive screen$/, async function () {
  await this.click(receiveTab);
});

Given(/^I go to the receive screen$/, async function () {
  await this.click(receiveTab);
});

When(/^I click on the Generate new address button$/, async function () {
  await this.click(generateAddressButton);
});

When(/^I click on the ([^ ]*) ([^ ]*) tab$/, async function (kind, chain) {
  const subTabButtonLocator = getSubTabButton(chain, kind);
  await this.click(subTabButtonLocator);
});

When(/^I click on the top-level address book tab$/, async function () {
  await this.click(addressBookTab);
});

When(/^I click on the top-level reward address tab$/, async function () {
  await this.click(rewardAddressTab);
});

When(/^I click on the All addresses button$/, async function () {
  await this.click(await getAllAddressesButton(this));
});
When(/^I click on the Unused addresses button$/, async function () {
  await this.click(await getUnusedAddressesButton(this));
});
When(/^I click on the Used addresses button$/, async function () {
  await this.click(await getUsedAddressesButton(this));
});
When(/^I click on the HasBalance addresses button$/, async function () {
  await this.click(await getHasBalanceButton(this));
});

When(/^I click on the Generate new address button ([0-9]+) times$/, async function (times) {
  for (let curr = 1; curr <= times; curr++) {
    await this.click(generateAddressButton);
    await this.waitForElement(getGeneratedAddress(curr));
  }
});

Then(/^I should see my latest address "([^"]*)" at the top$/, async function (address) {
  await this.waitUntilText(yourWalletAddrHeader, truncateAddress(address));
});

Then(/^I should see at least ([^"]*) addresses$/, async function (numAddresses) {
  const rows = await this.findElements(walletAddressRow);
  expect(rows.length).be.at.least(Number.parseInt(numAddresses, 10));
});

Then(
  /^I should see ([^"]*) addresses with address "([^"]*)" at the top$/,
  async function (numAddresses, address) {
    const rows = await this.findElements(walletAddressRow);
    expect(rows.length).to.equal(Number.parseInt(numAddresses, 10));
    const topAddr = await getAddressFromAddressRow(rows[0]);
    expect(topAddr).to.equal(truncateAddressShort(address));
  }
);

Then(/^I see every generated address is unique$/, async function () {
  const addresses = await this.findElements(walletAddressRow);
  const addressesStringArray = addresses.map(async (row) => await getAddressFromAddressRow(row));

  await Promise.all(addressesStringArray).then(async completed => {
    const unique = checkIfElementsInArrayAreUnique.call(this, completed);
    expect(unique).to.be.true;
    return undefined;
  });
});

Then(/^I should see the addresses exactly list them$/, async function (table) {
  const rows = table.hashes();
  const waitUntilAddressesAppeared = rows.map((row, index) =>
    this.waitUntilText(getGeneratedAddress(index), truncateAddressShort(row.address))
  );
  const noMoreAddressAppeared = this.waitForElementNotPresent(
    getGeneratedAddress(rows.length + 1)
  );
  waitUntilAddressesAppeared.push(noMoreAddressAppeared);
  await Promise.all(waitUntilAddressesAppeared);
});

Then(/^I shouldn't see the address "([^"]*)"$/, async function (address) {
  await this.waitForElementNotPresent(getAddress(truncateAddressShort(address)));
});

Then(/I should see an error about max unused addresses/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.unusedAddressesError',
  });
  await this.waitUntilText(addressErrorPhrase, errorMessage);
});
