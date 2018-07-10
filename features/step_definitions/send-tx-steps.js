import { Given, When, Then } from 'cucumber';
import { expect } from 'chai';

Given(/^I have a wallet with funds$/, async function () {
  const { adaWallet } = await this.getFromLocalStorage('WALLET');
  expect(adaWallet.cwAmount.getCCoin, 'Available founds').to.be.above(0);
});

When(/^I go to the send transaction screen$/, async function () {
  await this.click('.send');
});

When(/^I fill the form:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input('#receiver--2', fields.address);
  await this.input('#amount--3', fields.amount);
});

When(/^The transaction fees are "([^"]*)"$/, async function (fee) {
  await this.waitForContent(`//span[contains(text(), '+ ${fee} of fees')]`);
});

When(/^I click on the next button in the wallet send form$/, async function () {
  await this.click('.WalletSendForm_nextButton');
});

When(/^I see send money confirmation dialog$/, async function () {
  await this.waitForElement('.WalletSendConfirmationDialog_dialog');
});

When(/^I enter the wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input('#walletPassword--4', fields.password);
});

When(/^I submit the wallet send form$/, async function () {
  const button = '.confirmButton';
  await this.waitEnable(button);
  await this.click(button);
});

Then(/^I should see the summary screen$/, async function () {
  await this.waitForElement('.WalletSummary_component');
});

Then(/^I should see an invalid address error$/, async function () {
  await this.waitForElement('.receiver.SimpleInput_errored');
});

Then(/^I should see a not enough ada error$/, async function () {
  await this.waitForElement('.amount.SimpleInput_errored');
});

Then(/^I should not be able to submit$/, async function () {
  await this.waitForElement('.primary.SimpleButton_disabled');
});
