// @flow

import { Given, When, Then } from 'cucumber';
import { expect } from 'chai';
import i18n from '../support/helpers/i18n-helpers';

Given(/^I have a wallet with funds$/, async function () {
  await this.driver.wait(async () => {
    try {
      const { adaWallet } = await this.getFromLocalStorage('WALLET');
      expect(adaWallet.cwAmount.getCCoin, 'Available founds').to.be.above(0);
      return true;
    } catch (err) {
      return false;
    }
  });
});

When(/^I go to the send transaction screen$/, async function () {
  await this.click('.send');
});

When(/^I fill the form:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input("input[name='receiver']", fields.address);
  await this.input("input[name='amount']", fields.amount);
});

When(/^I fill the address of the form:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input("input[name='receiver']", fields.address);
});

When(/^I see CONFIRM TRANSACTION Pop up:$/, async function (table) {
  const fields = table.hashes()[0];
  const total = parseFloat(fields.amount) + parseFloat(fields.fee);
  await this.waitUntilText('.WalletSendConfirmationDialog_addressTo', fields.address);
  await this.waitUntilContainsText('.WalletSendConfirmationDialog_fees', fields.fee);
  await this.waitUntilContainsText('.WalletSendConfirmationDialog_amount', fields.amount);
  await this.waitUntilContainsText('.WalletSendConfirmationDialog_totalAmount', total);
});

When(/^I clear the receiver$/, async function () {
  await this.clearInput("input[name='receiver']");
});

When(/^I fill the receiver as "([^"]*)"$/, async function (receiver) {
  await this.input("input[name='receiver']", receiver);
});

When(/^The transaction fees are "([^"]*)"$/, async function (fee) {
  await this.waitUntilText('.AmountInputSkin_fees', `+ ${fee} of fees`);
});

When(/^I click on the next button in the wallet send form$/, async function () {
  await this.click('.WalletSendForm_nextButton');
});

When(/^I click on "Use all my ADA" checkbox$/, async function () {
  await this.click('.WalletSendForm_checkbox');
});

When(/^I see send money confirmation dialog$/, async function () {
  await this.waitForElement('.WalletSendConfirmationDialog_dialog');
});

When(/^I enter the wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input("input[name='walletPassword']", fields.password);
});

When(/^I submit the wallet send form$/, async function () {
  await this.click('.confirmButton');
});

Then(/^I should see the summary screen$/, async function () {
  await this.waitForElement('.WalletSummary_component');
});

Then(/^I should see an invalid address error$/, async function () {
  await this.waitForElement('.receiver .SimpleInput_errored');
});

Then(/^I should see a not enough ada error$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'api.errors.NotEnoughMoneyToSendError' });
  await this.waitUntilText('.SimpleFormField_error', errorMessage);
});

Then(/^I should not be able to submit$/, async function () {
  await this.waitForElement('.primary.SimpleButton_disabled');
});

Then(/^I should see an invalid signature error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'api.errors.invalidWitnessError' });
  await this.waitUntilText('.WalletSendConfirmationDialog_error', errorMessage);
});

Then(/^I should see an incorrect wallet password error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'api.errors.IncorrectPasswordError' });
  await this.waitUntilText('.WalletSendConfirmationDialog_error', errorMessage);
});

/**
 * This is a hack to generate a completely different wallet within a test file
 */
Given(/^I cleared my local balance$/, async function () {
  // first switch the xpub so the generated addresses are different
  const myAccount = await this.getFromLocalStorage('ACCOUNT');
  myAccount.root_cached_key = '815c1f331d4a7bbf2c1e15ee8983bf9b7abb980f15cecb1f868920ec2b7cf19cab1e147544a2a0550a3d5d3b527aeb0db8af42756e68572e1e96142990d27d6c';
  await this.saveToLocalStorage('ACCOUNT', myAccount);

  // then drop the DB state so all previous saved addresses are gone
  await this.dropDB();

  // next clear the cached local balance
  const myWallet = await this.getFromLocalStorage('WALLET');
  myWallet.adaWallet.cwAmount = { getCCoin: '0' };
  await this.saveToLocalStorage('WALLET', myWallet);
});
