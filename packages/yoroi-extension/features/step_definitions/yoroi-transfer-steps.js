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

async function confirmAttentionScreen(customWorld: Object){
  // Attention screen
  await customWorld.waitForElement('.HardwareDisclaimer_component');
  const disclaimerClassElement = await customWorld.driver.findElement(By.css('.HardwareDisclaimer_component'));
  const checkbox = await disclaimerClassElement.findElement(By.xpath('//input[@type="checkbox"]'));
  await checkbox.click();
  await customWorld.click('//button[text()="I understand"]', By.xpath);
}

Given(/^I am on the transfer start screen$/, async function () {
  await navigateTo.call(this, '/transfer');
  await waitUntilUrlEquals.call(this, '/transfer');
});

When(/^I click skip the transfer$/, async function () {
  await this.click('.cancelTransferButton');
});
When(/^I click on the shelley button on the transfer screen$/, async function () {
  await this.click('.TransferCards_shelleyEra');
});
When(/^I click on the byron button on the transfer screen$/, async function () {
  await this.click('.TransferCards_byronEra');
});
Then(/^I click on the icarus tab$/, async function () {
  await this.click('.IcarusTab');
});
Then(/^I select the Byron 15-word option$/, async function () {
  await this.click('.fromIcarusWallet15Word_restoreNormalWallet');
});

Then(/^I select the Shelley 15-word option$/, async function () {
  await this.click('.ShelleyOptionDialog_restoreNormalWallet');
});
Then(/^I select the Shelley paper wallet option$/, async function () {
  await this.click('.ShelleyOptionDialog_restorePaperWallet');
});
When(/^I enter the key "([^"]*)"$/, async function (password) {
  await this.input("input[name='key']", password);
});
When(/^I enter the decryption password "([^"]*)"$/, async function (password) {
  await this.input("input[name='decryptionPassword']", password);
});
Then(/^I select the private key option$/, async function () {
  await this.click('.ShelleyOptionDialog_masterKey');
});
Then(/^I select the yoroi paper wallet option$/, async function () {
  await this.click('.fromIcarusPaperWallet_restorePaperWallet');
});
Then(/^I see the transfer transaction$/, async function () {
  await this.waitForElement('.TransferSummaryPage_body');
});
Then(/^I accept the prompt$/, async function () {
  await this.click('.primary');
});
Then(/^I select the trezor option$/, async function () {
  await this.click('.fromTrezor_connectTrezor');
  // Attention screen
  await confirmAttentionScreen(this);
});
Then(/^I select the ledger option$/, async function () {
  await this.click('.fromLedger_connectLedger');
  // Attention screen
  await confirmAttentionScreen(this);
});
When(/^I click on the yoroiPaper button on the Yoroi Transfer start screen$/, async function () {
  await this.click('.yoroiPaper');
});

Then(/^I should see the Yoroi transfer error screen$/, async function () {
  const errorPageTitle = await i18n.formatMessage(this.driver,
    { id: 'api.errors.generateTransferTxError' });
  await this.waitUntilText('.ErrorPage_title', errorPageTitle);
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
  await this.click('.transferButton');
});

Then(/^I should see the Yoroi transfer success screen$/, async function () {
  const successPageTitle = await i18n.formatMessage(this.driver,
    { id: 'yoroiTransfer.successPage.title' });
  await this.waitUntilText('.SuccessPage_title', successPageTitle.toUpperCase());
});

Then(/^I should see the transfer screen disabled$/, async function () {
  const noWalletMessage = await i18n.formatMessage(
    this.driver,
    { id: 'wallet.nowallet.title' }
  );
  await this.waitUntilText('.FullscreenMessage_title', noWalletMessage);
});

Then(/^I should see the "CREATE YOROI WALLET" button disabled$/, async function () {
  await this.waitDisable('.createYoroiWallet.YoroiTransferStartPage_button');
});

Then(/^I should see wallet changed notice$/, async function () {
  const walletChangedError = await i18n.formatMessage(this.driver,
    { id: 'yoroiTransfer.error.walletChangedError' });
  await this.waitUntilText('.TransferSummaryPage_error', walletChangedError);
});

When(/^I keep the staking key$/, async function () {
  await this.click(`//button[contains(text(), "Keep registered")]`, By.xpath);
});

Then(/^I see the deregistration for the transaction$/, async function () {
  await this.waitForElement('.TransferSummaryPage_refund');
});

Then(/^I do not see the deregistration for the transaction$/, async function () {
  await this.waitForElementNotPresent('.TransferSummaryPage_refund');
});
