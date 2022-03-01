// @flow

import { Given, When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';
import i18n from '../support/helpers/i18n-helpers';
import { addTransaction, generateTransaction } from '../mock-chain/mockCardanoImporter';
import { setExpectedTx } from '../mock-chain/mockCardanoServer';
import { truncateAddress } from '../../app/utils/formatters';
import {
  networks,
  defaultAssets,
} from '../../app/api/ada/lib/storage/database/prepackaged/networks';

Given(/^I have a wallet with funds$/, async function () {
  const amountWithCurrency = await this.driver.findElements(
    By.xpath("//div[@class='WalletTopbarTitle_walletAmount']")
  );
  const matchedAmount = /^"([0-9]*\.[0-9]*)".*$/.exec(amountWithCurrency);
  if (!matchedAmount) return false;
  const amount = parseFloat(matchedAmount[1]);
  expect(Number(amount), 'Available funds').to.be.above(0);
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

Given(/^The expected transaction is "([^"]*)"$/, base64Tx => {
  setExpectedTx(base64Tx);
});

When(/^I see CONFIRM TRANSACTION Pop up:$/, async function (table) {
  const fields = table.hashes()[0];
  const total = parseFloat(fields.amount) + parseFloat(fields.fee);

  await this.waitUntilText(
    '.WalletSendConfirmationDialog_addressTo',
    truncateAddress(fields.address)
  );
  await this.waitUntilContainsText('.WalletSendConfirmationDialog_fees', fields.fee);
  await this.waitUntilContainsText('.WalletSendConfirmationDialog_amount', fields.amount);

  const network = networks.CardanoMainnet;
  const assetInfo = defaultAssets.filter(asset => asset.NetworkId === network.NetworkId)[0];
  const decimalPlaces = assetInfo.Metadata.numberOfDecimals;
  await this.waitUntilContainsText(
    '.WalletSendConfirmationDialog_totalAmount',
    total.toFixed(decimalPlaces)
  );
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
  const result = await this.customWaiter(async () => {
    const messageElement = await this.driver
      .findElement(By.css('.WalletSendForm_amountInput'))
      .findElement(By.xpath('//p'));
    const messageText = await messageElement.getText();
    return messageText === `+ ${fee} of fees`;
  })
  expect(result).to.be.true;
});

When(/^I click on the next button in the wallet send form$/, async function () {
  const button = '.WalletSendForm_component .MuiButton-primary';
  await this.waitForElement(button);
  await this.click(button);
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
    await this.click(button);
  } catch (e) {
    // if the first click succeeded, the second will throw an exception
    // saying that the button can't be clicked because a dialog is in the way
  }
});

When(/^I click on "Send all" checkbox$/, async function () {
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

Then(/^I should see the successfully sent page$/, async function () {
  await this.waitForElement('.SuccessPage_title');
});

Then(/^I click the transaction page button$/, async function () {
  await this.click("//button[contains(text(), 'Transaction page')]", By.xpath);
});

Then(/^I should see the summary screen$/, async function () {
  await this.waitForElement('.WalletSummary_component');
});

Then(/^I should see an invalid address error$/, async function () {
  await this.waitForElement('.receiver .SimpleInput_errored');
});

Then(/^I should see a not enough ada error$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.NotEnoughMoneyToSendError',
  });
  await this.waitUntilText('.FormFieldOverridesClassic_error', errorMessage);
});

Then(/^I should not be able to submit$/, async function () {
  await this.waitForElement('.primary.SimpleButton_disabled');
});

Then(/^I should see an invalid signature error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.invalidWitnessError',
  });
  await this.waitUntilText('.WalletSendConfirmationDialog_error', errorMessage);
});

Then(/^I should see an incorrect wallet password error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.IncorrectPasswordError',
  });
  await this.waitUntilText('.WalletSendConfirmationDialog_error', errorMessage);
});

Then(/^I should see an delegation incorrect wallet password error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.IncorrectPasswordError',
  });
  await this.waitUntilText('.DelegationTxDialog_error', errorMessage);
});

Then(/^A successful tx gets sent from my wallet from another client$/, () => {
  const txs = generateTransaction();
  addTransaction(txs.postLaunchSuccessfulTx);
});

Then(/^A pending tx gets sent from my wallet from another client$/, () => {
  const txs = generateTransaction();
  addTransaction(txs.postLaunchPendingTx);
});

Then(/^I should see a warning block$/, async function () {
  await this.waitForElement('.WarningBox_warning');
});

Then(/^I should see no warning block$/, async function () {
  await this.waitForElementNotPresent('.WarningBox_warning');
});

When(/^I click on the unmangle button$/, async function () {
  await this.click('.MangledHeader_submitButton ');
});

When(/^I open the token selection dropdown$/, async function () {
  await this.click('.WalletSendForm_component .SimpleInput_input');
});

When(/^I select token "([^"]*)"$/, async function (tokenName) {
  const tokenRows = await this.getElementsBy('.TokenOptionRow_item_name');
  for (const row of tokenRows) {
    const name = await row.getText();
    if (name === tokenName) {
      await row.click();
    }
  }
});

When(/^I open the amount dropdown and select send all$/, async function () {
  await this.driver.executeScript(
    `const dropdownInput = document.querySelector('input[value="Custom Amount"]').click;
    const tokenList = document.querySelectorAll('.TokenOptionRow_item_name');
    for(let token of tokenList){
      if(token.innerHTML.startsWith('Send all')){
        token.click()
         }
     }
`
  );
});
