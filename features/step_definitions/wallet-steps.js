// @flow

import { When, Then } from 'cucumber';

When(/^I enter the name "([^"]*)"$/, async function (walletName) {
  await this.input('#walletName--2', walletName);
});

When(/^I clear the name "([^"]*)"$/, async function (walletName) {
  await this.clearInputUpdatingForm('#walletName--2', walletName.length);
});

When(/^I navigate to wallet transactions screen$/, async function () {
  await this.click('.TopBarCategory_componentClassic.wallets');
  await this.waitForElement('.WalletTopbarTitle_walletName');
});

Then(/^I should see the opened wallet with name "([^"]*)"$/, async function (walletName) {
  const walletNameFormatted = walletName.toUpperCase();
  await this.waitUntilText('.WalletTopbarTitle_walletName', walletNameFormatted);
});
