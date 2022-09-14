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
import { walletSummaryBox } from '../pages/walletTransactionsPage';

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
  await this.click({ locator: '.send', method: 'css' });
});

When(/^I select the asset "(.+)" on the form$/, async function (assetName) {
  await this.click({ locator: `#tokenAssetsSelect`, method: 'css' });
  const locator = { locator: `//p[contains(text(), '${assetName}')]`, method: 'xpath' };
  await this.click(locator);
});

When(/^I fill the form:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input({ locator: "input[name='receiver']", method: 'css' }, fields.address);
  await this.input({ locator: "input[name='amount']", method: 'css' }, fields.amount);
});

When(/^I fill the address of the form:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input({ locator: "input[name='receiver']", method: 'css' }, fields.address);
});

Given(/^The expected transaction is "([^"]*)"$/, base64Tx => {
  setExpectedTx(base64Tx);
});

When(/^I see CONFIRM TRANSACTION Pop up:$/, async function (table) {
  const fields = table.hashes()[0];
  const total = parseFloat(fields.amount) + parseFloat(fields.fee);

  await this.waitUntilText(
    { locator: '.WalletSendConfirmationDialog_addressTo', method: 'css' },
    truncateAddress(fields.address)
  );
  await this.waitUntilContainsText(
    { locator: '.WalletSendConfirmationDialog_fees', method: 'css' },
    fields.fee
  );
  await this.waitUntilContainsText(
    { locator: '.WalletSendConfirmationDialog_amount', method: 'css' },
    fields.amount
  );

  const network = networks.CardanoMainnet;
  const assetInfo = defaultAssets.filter(asset => asset.NetworkId === network.NetworkId)[0];
  const decimalPlaces = assetInfo.Metadata.numberOfDecimals;
  await this.waitUntilContainsText(
    { locator: '.WalletSendConfirmationDialog_totalAmount', method: 'css' },
    total.toFixed(decimalPlaces)
  );
});

When(/^I clear the receiver$/, async function () {
  await this.clearInput({ locator: "input[name='receiver']", method: 'css' });
});

When(/^I clear the wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm(
    { locator: "input[name='walletPassword']", method: 'css' },
    password.length
  );
});

When(/^I fill the receiver as "([^"]*)"$/, async function (receiver) {
  await this.input({ locator: "input[name='receiver']", method: 'css' }, receiver);
});

When(/^The transaction fees are "([^"]*)"$/, async function (fee) {
  const result = await this.customWaiter(async () => {
    const messageElement = await this.driver
      .findElement(By.css('.WalletSendForm_amountInput'))
      .findElement(By.xpath('//p'));
    const messageText = await messageElement.getText();
    return messageText === `+ ${fee} of fees`;
  });
  expect(result).to.be.true;
});

When(/^I click on the next button in the wallet send form$/, async function () {
  const button = '.WalletSendForm_component .MuiButton-primary';
  await this.waitForElement({ locator: button, method: 'css' });
  await this.click({ locator: button, method: 'css' });
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
    await this.click({ locator: button, method: 'css' });
  } catch (e) {
    // if the first click succeeded, the second will throw an exception
    // saying that the button can't be clicked because a dialog is in the way
  }
});

When(/^I click on "Send all" checkbox$/, async function () {
  await this.click({ locator: '.WalletSendForm_checkbox', method: 'css' });
});

When(/^I see send money confirmation dialog$/, async function () {
  await this.waitForElement({ locator: '.WalletSendConfirmationDialog_dialog', method: 'css' });
});

When(/^I enter the wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input({ locator: "input[name='walletPassword']", method: 'css' }, fields.password);
});

When(/^I submit the wallet send form$/, async function () {
  await this.click({ locator: '.confirmButton', method: 'css' });
});

Then(/^I should see the successfully sent page$/, async function () {
  await this.waitForElement({ locator: '.SuccessPage_title', method: 'css' });
});

Then(/^I click the transaction page button$/, async function () {
  await this.click({ locator: "//button[contains(text(), 'Transaction page')]", method: 'xpath' });
});

Then(/^I should see the summary screen$/, async function () {
  await this.waitForElement({ locator: '.WalletSummary_component', method: 'css' });
});

Then(/^Revamp. I should see the summary screen$/, async function () {
  await this.waitForElement(walletSummaryBox);
});

Then(/^I should see an invalid address error$/, async function () {
  await this.waitForElement({ locator: '.receiver .SimpleInput_errored', method: 'css' });
});

Then(/^I should see a not enough ada error$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.NotEnoughMoneyToSendError',
  });
  await this.waitUntilText(
    { locator: '.FormFieldOverridesClassic_error', method: 'css' },
    errorMessage
  );
});

Then(/^I should not be able to submit$/, async function () {
  await this.waitForElement({ locator: '.primary.SimpleButton_disabled', method: 'css' });
});

Then(/^I should see an invalid signature error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.invalidWitnessError',
  });
  await this.waitUntilText(
    { locator: '.WalletSendConfirmationDialog_error', method: 'css' },
    errorMessage
  );
});

Then(/^I should see an incorrect wallet password error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.IncorrectPasswordError',
  });
  await this.waitUntilText(
    { locator: '.WalletSendConfirmationDialog_error', method: 'css' },
    errorMessage
  );
});

Then(/^I should see an delegation incorrect wallet password error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.IncorrectPasswordError',
  });
  await this.waitUntilText({ locator: '.DelegationTxDialog_error', method: 'css' }, errorMessage);
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
  await this.waitForElement({ locator: '.WarningBox_warning', method: 'css' });
});

Then(/^I should see no warning block$/, async function () {
  await this.waitForElementNotPresent({ locator: '.WarningBox_warning', method: 'css' });
});

When(/^I click on the unmangle button$/, async function () {
  await this.click({ locator: '.MangledHeader_submitButton ', method: 'css' });
});

When(/^I open the token selection dropdown$/, async function () {
  await this.click({ locator: '.WalletSendForm_component .SimpleInput_input', method: 'css' });
});

When(/^I select token "([^"]*)"$/, async function (tokenName) {
  const tokenRows = await this.getElementsBy({
    locator: '.TokenOptionRow_item_name',
    method: 'css',
  });
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
