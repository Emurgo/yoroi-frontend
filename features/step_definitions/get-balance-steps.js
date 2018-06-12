import { When, Then } from 'cucumber';
import chai from 'chai';

When(/^I see the balance$/, async function () {
  await this.waitForElement('.TopBar_walletAmount');
});

Then(/^I should see the balance number "([^"]*)"$/, async function (number) {
  const balance = await this.getText('.TopBar_walletAmount');
  chai.expect(balance).to.equal(number);
});
