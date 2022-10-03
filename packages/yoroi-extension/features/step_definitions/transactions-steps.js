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
import { walletSummaryBox, walletSummaryComponent } from '../pages/walletTransactionsPage';
import {
  amountInput,
  assetListElement,
  assetSelector,
  disabledSubmitButton,
  invalidAddressError,
  nextButton,
  notEnoughAdaError,
  receiverInput,
  sendAllCheckbox,
  sendConfirmationDialogAddressToText,
  sendConfirmationDialogAmountText,
  sendConfirmationDialogError,
  sendConfirmationDialogFeesText,
  sendConfirmationDialogTotalAmountText,
  sendMoneyConfirmationDialog,
  submitButton,
  successPageTitle,
  transactionPageButton,
  warningBox,
} from '../pages/walletSendPage';
import { sendTab } from '../pages/walletPage';
import { walletPasswordInput } from '../pages/restoreWalletPage';
import { delegationTxDialogError } from '../pages/walletDelegationPage';
import { unmangleButton } from '../pages/walletReceivePage';
import { walletSummaryBox } from '../pages/walletTransactionsHistoryPage';
import {
  getTokenLocator,
  selectAssetDropDown,
  selectSendingAmountDropDown,
  sendAllItem
} from '../pages/walletSendPage';
import { halfSecond, oneMinute } from '../support/helpers/common-constants';

const filterInputByBrowser = async (customWorld: any, inputData: any): Promise<any> => {
  const browserName = await customWorld.getBrowser();
  const rows = inputData.hashes();
  let fields = rows.filter(row => row.browser === browserName)[0];

  if (!fields){
    fields = rows[0];
  }

  return fields;
};

Given(/^I have a wallet with funds$/, async function () {
  await this.waitUntilContainsText(
    { locator: '.NavWalletDetails_amount', method: 'css' },
    'ADA',
    oneMinute
  );
  const balanceTextElement = await this.findElement({ locator: '.NavWalletDetails_amount', method: 'css' });
  const balanceText = await balanceTextElement.getText();
  const [balance, ] = balanceText.split(' ');
  expect(parseFloat(balance), 'The wallet is empty').to.be.above(0);
});

When(/^I go to the send transaction screen$/, async function () {
  await this.click(sendTab);
});

When(/^I select the asset "(.+)" on the form$/, async function (assetName) {
  await this.click({ locator: `#tokenAssetsSelect`, method: 'css' });
  const locator = { locator: `//p[contains(text(), '${assetName}')]`, method: 'xpath' };
  await this.click(locator);
});

When(/^I fill the form:$/, async function (table) {
  const fields = await filterInputByBrowser(this, table);
  await this.waitForElement(receiverInput);
  await this.waitForElement(amountInput);
  await this.input(receiverInput, fields.address);
  await this.input(amountInput, fields.amount);
});

When(/^I fill the address of the form:$/, async function (table) {
  const fields = await filterInputByBrowser(this, table);
  await this.waitForElement(receiverInput);
  await this.input(receiverInput, fields.address);
});

Given(/^The expected transaction is "([^"]*)"$/, base64Tx => {
  setExpectedTx(base64Tx);
});

When(/^I see CONFIRM TRANSACTION Pop up:$/, async function (table) {
  const fields = table.hashes()[0];
  const total = parseFloat(fields.amount) + parseFloat(fields.fee);

  await this.waitUntilText(sendConfirmationDialogAddressToText, truncateAddress(fields.address));
  await this.waitUntilContainsText(sendConfirmationDialogFeesText, fields.fee);
  await this.waitUntilContainsText(sendConfirmationDialogAmountText, fields.amount);

  const network = networks.CardanoMainnet;
  const assetInfo = defaultAssets.filter(asset => asset.NetworkId === network.NetworkId)[0];
  const decimalPlaces = assetInfo.Metadata.numberOfDecimals;
  await this.waitUntilContainsText(
    sendConfirmationDialogTotalAmountText,
    total.toFixed(decimalPlaces)
  );
});

When(/^I clear the receiver$/, async function () {
  await this.clearInput(receiverInput);
});

When(/^I clear the wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm(walletPasswordInput, password.length);
});

When(/^I fill the receiver as "([^"]*)"$/, async function (receiver) {
  await this.input(receiverInput, receiver);
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
  await this.waitForElement(nextButton);
  await this.click(nextButton);
  /**
   * Sometimes out tests fail because clicking this button isn't triggering a dialog
   * However it works flawlessly both locally and on localci
   *
   * My only guess is that mobx re-disables this button in a way that only causes
   * the condition to happen on low-resouruce machines like we use for CI
   *
   * I attempt to fix it by just clicking twice after a delay
   */
  await this.driver.sleep(halfSecond);
  try {
    await this.click(nextButton);
  } catch (e) {
    // if the first click succeeded, the second will throw an exception
    // saying that the button can't be clicked because a dialog is in the way
  }
});

When(/^I click on "Send all" checkbox$/, async function () {
  await this.click(sendAllCheckbox);
});

When(/^I see send money confirmation dialog$/, async function () {
  await this.waitForElement(sendMoneyConfirmationDialog);
});

When(/^I enter the wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input(walletPasswordInput, fields.password);
});

When(/^I submit the wallet send form$/, async function () {
  await this.click(submitButton);
});

Then(/^I should see the successfully sent page$/, async function () {
  await this.waitForElement(successPageTitle);
});

Then(/^I click the transaction page button$/, async function () {
  await this.click(transactionPageButton);
});

Then(/^I should see the summary screen$/, async function () {
  await this.waitForElement(walletSummaryComponent);
});

Then(/^Revamp. I should see the summary screen$/, async function () {
  await this.waitForElement(walletSummaryBox);
});

Then(/^I should see an invalid address error$/, async function () {
  await this.waitForElement(invalidAddressError);
});

Then(/^I should see a not enough ada error$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.NotEnoughMoneyToSendError',
  });
  await this.waitUntilText(notEnoughAdaError, errorMessage);
});

Then(/^I should not be able to submit$/, async function () {
  await this.waitForElement(disabledSubmitButton);
});

Then(/^I should see an invalid signature error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.invalidWitnessError',
  });
  await this.waitUntilText(sendConfirmationDialogError, errorMessage);
});

Then(/^I should see an incorrect wallet password error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.IncorrectPasswordError',
  });
  await this.waitUntilText(sendConfirmationDialogError, errorMessage);
});

Then(/^I should see an delegation incorrect wallet password error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.IncorrectPasswordError',
  });
  await this.waitUntilText(delegationTxDialogError, errorMessage);
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
  await this.waitForElement(warningBox);
});

Then(/^I should see no warning block$/, async function () {
  await this.waitForElementNotPresent(warningBox);
});

When(/^I click on the unmangle button$/, async function () {
  await this.click(unmangleButton);
});

When(/^I open the token selection dropdown$/, async function () {
  await this.click(selectAssetDropDown);
});

When(/^I select token "([^"]*)"$/, async function (tokenName) {
  await this.click(getTokenLocator(tokenName));
});

When(/^I open the amount dropdown and select send all$/, async function () {
  await this.click(selectSendingAmountDropDown);
  await this.driver.sleep(halfSecond);
  await this.click(sendAllItem);
});
