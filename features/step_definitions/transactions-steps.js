// @flow

import { Given, When, Then } from 'cucumber';
import { expect } from 'chai';
import i18n from '../support/helpers/i18n-helpers';
import { addTransaction, postLaunchSuccessfulTx, postLaunchPendingTx } from '../mock-chain/mockImporter';

Given(/^I have a wallet with funds$/, async function () {
  await this.driver.wait(async () => {
    try {
      const { adaWallet } = await this.getFromLocalStorage('WALLET');
      expect(Number(adaWallet.cwAmount.getCCoin), 'Available founds').to.be.above(0);
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

When(/^I clear the wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm("input[name='walletPassword']", password.length);
});

When(/^I fill the receiver as "([^"]*)"$/, async function (receiver) {
  await this.input("input[name='receiver']", receiver);
});

When(/^The transaction fees are "([^"]*)"$/, async function (fee) {
  await this.waitUntilText('.AmountInputSkin_fees', `+ ${fee} of fees`);
});

When(/^I click on the next button in the wallet send form$/, async function () {
  await this.click('.WalletSendForm_nextButton');
  /**
   * Sometimes out tests fail because clicking this button isn't triggering a dialog
   * However it works flawlessly both locally and on localci
   *
   * My only guess is that mobx re-disables this button in a way that only causes
   * the condition to happen on low-resouruce machines like we use for CI
   *
   * I attempt to fix it by just clicking twice after a delay
   */
  await this.driver.sleep(500);
  try {
    await this.click('.WalletSendForm_nextButton');
  } catch (e) {
    // if the first click succeeded, the second will throw an exception
    // saying that the button can't be clicked because a dialog is in the way
  }
});

When(/^I click on "Send all my ADA" checkbox$/, async function () {
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

Then(/^A successful tx gets sent from my wallet from another client$/, () => {
  addTransaction(postLaunchSuccessfulTx);
});

Then(/^A pending tx gets sent from my wallet from another client$/, () => {
  addTransaction(postLaunchPendingTx);
});

Then(/^I should see a warning block$/, async function () {
  await this.waitForElement('.WarningBox_warning');
});

Then(/^I should see no warning block$/, async function () {
  await this.waitForElementNotPresent('.WarningBox_warning');
});
