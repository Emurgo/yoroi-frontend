import { When, Then } from 'cucumber';
import chai from 'chai';

Then(/^I should see the balance number "([^"]*)"$/, async function (number) {
  await this.waitUntilText('.TopBar_walletAmount', number);
});
