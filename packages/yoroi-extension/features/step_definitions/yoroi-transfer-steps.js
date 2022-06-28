// @flow

import { Given, When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import {
  navigateTo,
  waitUntilUrlEquals
} from '../support/helpers/route-helpers';
import i18n from '../support/helpers/i18n-helpers';
import {
  checkAddressesRecoveredAreCorrect,
  checkFinalBalanceIsCorrect,
  checkWithdrawalAddressesRecoveredAreCorrect,
} from '../support/helpers/transfer-helpers';
import { claimTransferTab } from '../pages/walletPage';
import { byronButton } from '../pages/walletClaimTransferPage';

async function confirmAttentionScreen(customWorld: Object){
  // Attention screen
  await customWorld.waitForElement({ locator: '.HardwareDisclaimer_component', method: 'css' });
  const disclaimerClassElement = await customWorld.driver.findElement(By.css('.HardwareDisclaimer_component'));
  const checkbox = await disclaimerClassElement.findElement(By.xpath('//input[@type="checkbox"]'));
  await checkbox.click();
  await customWorld.click({ locator: '//button[text()="I understand"]', method: 'xpath' });
}

Given(/^I am on the transfer start screen$/, async function () {
  await navigateTo.call(this, '/transfer');
  await waitUntilUrlEquals.call(this, '/transfer');
});

Given(/^Revamp. I go to the claim\/transfer page$/, async function () {
  await this.click(claimTransferTab);
});

When(/^I click skip the transfer$/, async function () {
  await this.click({ locator: '.cancelTransferButton', method: 'css' });
});
When(/^I click on the shelley button on the transfer screen$/, async function () {
  await this.click({ locator: '.TransferCards_shelleyEra', method: 'css' });
});
When(/^I click on the byron button on the transfer screen$/, async function () {
  await this.click(byronButton);
});
Then(/^I click on the icarus tab$/, async function () {
  await this.click({ locator: '.IcarusTab', method: 'css' });
});
Then(/^I select the Byron 15-word option$/, async function () {
  await this.click({ locator: '.fromIcarusWallet15Word_restoreNormalWallet', method: 'css' });
});

Then(/^I select the Shelley 15-word option$/, async function () {
  await this.click({ locator: '.ShelleyOptionDialog_restoreNormalWallet', method: 'css' });
});
Then(/^I select the Shelley paper wallet option$/, async function () {
  await this.click({ locator: '.ShelleyOptionDialog_restorePaperWallet', method: 'css' });
});
When(/^I enter the key "([^"]*)"$/, async function (password) {
  await this.input({ locator: "input[name='key']", method: 'css' }, password);
});
When(/^I enter the decryption password "([^"]*)"$/, async function (password) {
  await this.input({ locator: "input[name='decryptionPassword']", method: 'css' }, password);
});
Then(/^I select the private key option$/, async function () {
  await this.click({ locator: '.ShelleyOptionDialog_masterKey', method: 'css' });
});
Then(/^I select the yoroi paper wallet option$/, async function () {
  await this.click({ locator: '.fromIcarusPaperWallet_restorePaperWallet', method: 'css' });
});
Then(/^I see the transfer transaction$/, async function () {
  await this.waitForElement({ locator: '.TransferSummaryPage_body', method: 'css' });
});
Then(/^I accept the prompt$/, async function () {
  await this.click({ locator: '.primary', method: 'css' });
});
Then(/^I select the trezor option$/, async function () {
  await this.click({ locator: '.fromTrezor_connectTrezor', method: 'css' });
  // Attention screen
  await confirmAttentionScreen(this);
});
Then(/^I select the ledger option$/, async function () {
  await this.click({ locator: '.fromLedger_connectLedger', method: 'css' });
  // Attention screen
  await confirmAttentionScreen(this);
});
When(/^I click on the yoroiPaper button on the Yoroi Transfer start screen$/, async function () {
  await this.click({ locator: '.yoroiPaper', method: 'css' });
});

Then(/^I should see the Yoroi transfer error screen$/, async function () {
  const errorPageTitle = await i18n.formatMessage(this.driver,
    { id: 'api.errors.generateTransferTxError' });
  await this.waitUntilText({ locator: '.ErrorPage_title', method: 'css' }, errorPageTitle);
});

Then(/^I should see on the Yoroi transfer summary screen:$/, async function (table) {
  const rows = table.hashes();
  const fields = rows[0];
  await checkAddressesRecoveredAreCorrect(rows, this);
  await checkFinalBalanceIsCorrect(fields, this, !!fields.reward);
});

Then(/^I should see on the Yoroi withdrawal transfer summary screen:$/, async function (table) {
  const rows = table.hashes();
  const fields = rows[0];
  await checkWithdrawalAddressesRecoveredAreCorrect(rows, this);
  await checkFinalBalanceIsCorrect(fields, this, !!fields.reward);
});

When(/^I confirm Yoroi transfer funds$/, async function () {
  await this.click({ locator: '.transferButton', method: 'css' });
});

Then(/^I should see the Yoroi transfer success screen$/, async function () {
  const successPageTitle = await i18n.formatMessage(this.driver,
    { id: 'yoroiTransfer.successPage.title' });
  await this.waitUntilText({ locator: '.SuccessPage_title', method: 'css' }, successPageTitle.toUpperCase());
});

Then(/^I should see the transfer screen disabled$/, async function () {
  const noWalletMessage = await i18n.formatMessage(
    this.driver,
    { id: 'wallet.nowallet.title' }
  );
  await this.waitUntilText({ locator: '.FullscreenMessage_title', method: 'css' }, noWalletMessage);
});

Then(/^I should see the "CREATE YOROI WALLET" button disabled$/, async function () {
  await this.waitDisable({ locator: '.createYoroiWallet.YoroiTransferStartPage_button', method: 'css' });
});

Then(/^I should see wallet changed notice$/, async function () {
  const walletChangedError = await i18n.formatMessage(this.driver,
    { id: 'yoroiTransfer.error.walletChangedError' });
  await this.waitUntilText({ locator: '.TransferSummaryPage_error', method: 'css' }, walletChangedError);
});

When(/^I keep the staking key$/, async function () {
  await this.click({ locator: `//button[contains(text(), "Keep registered")]`, method: 'xpath' });
});

Then(/^I see the deregistration for the transaction$/, async function () {
  await this.waitForElement({ locator: '.TransferSummaryPage_refund', method: 'css' });
});

Then(/^I do not see the deregistration for the transaction$/, async function () {
  await this.waitForElementNotPresent({ locator: '.TransferSummaryPage_refund', method: 'css' });
});
