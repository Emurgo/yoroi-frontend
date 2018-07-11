import { When, Then } from 'cucumber';
import chai from 'chai';

When(/^I see the balance$/, async function () {
  await this.waitForElement('.TopBar_walletAmount');
});

Then(/^I should see the balance number "([^"]*)"$/, async function (number) {
  await this.waitUntilText('.TopBar_walletAmount', number);
});
