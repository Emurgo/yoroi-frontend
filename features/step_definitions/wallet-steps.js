import { When, Then } from 'cucumber';

When(/^I enter the name "([^"]*)"$/, async function (walletName) {
  await this.input('#walletName--1', walletName);
});

Then(/^I should see the opened wallet$/, async function () {
  await this.waitForElement('.TopBar_walletName');
});
