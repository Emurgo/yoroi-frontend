import { Given, When, Then } from 'cucumber';
import {
  navigateTo,
  waitUntilUrlEquals
} from '../support/helpers/route-helpers';
import { getMockData } from '../support/mockDataBuilder';

When(/^I enter the name "([^"]*)"$/, async function (walletName) {
  await this.input('#walletName--2', walletName);
});

When(/^I clear the name "([^"]*)"$/, async function (walletName) {
  await this.clearInputUpdatingForm('#walletName--2', walletName.length);
});

Then(/^I should see the opened wallet with name "([^"]*)"$/, async function (walletName) {
  const walletNameFormatted = walletName.toUpperCase();
  await this.waitUntilText('.TopBar_walletName', walletNameFormatted);
});

Given(/^I am on the wallet "([^"]*)" screen$/, async function (screen) {
  const { wallet } = getMockData();
  const url = `/wallets/${wallet.cwId}/${screen}`;
  await navigateTo.call(this, url);
  await waitUntilUrlEquals.call(this, url);
});
