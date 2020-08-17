// @flow

import { Given, When, Then } from 'cucumber';
import {
  navigateTo,
  waitUntilUrlEquals
} from '../support/helpers/route-helpers';
import i18n from '../support/helpers/i18n-helpers';
import {
  checkAddressesRecoveredAreCorrect,
  checkWithdrawalAddressesRecoveredAreCorrect,
  checkTotalAmountIsCorrect
} from '../support/helpers/transfer-helpers';

Given(/^I am on the transfer start screen$/, async function () {
  await navigateTo.call(this, '/transfer');
  await waitUntilUrlEquals.call(this, '/transfer');
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
Then(/^I select the yoroi paper wallet option$/, async function () {
  await this.click('.fromIcarusPaperWallet_restorePaperWallet');
});
Then(/^I accept the prompt$/, async function () {
  await this.click('.primary');
});
Then(/^I select the trezor option$/, async function () {
  await this.click('.fromTrezor_connectTrezor');
  await this.click('.SimpleCheckbox_check');
  await this.click('.primary');
});
When(/^I click on the yoroiPaper button on the Yoroi Transfer start screen$/, async function () {
  await this.click('.yoroiPaper');
});

Then(/^I should see the Yoroi transfer error screen$/, async function () {
  const errorPageTitle = await i18n.formatMessage(this.driver,
    { id: 'yoroiTransfer.errorPage.title.label' });
  await this.waitUntilText('.ErrorPage_title', errorPageTitle);
});

Then(/^I should see on the Yoroi transfer summary screen:$/, async function (table) {
  const rows = table.hashes();
  await checkAddressesRecoveredAreCorrect(rows, this);
  await checkTotalAmountIsCorrect(rows, this);
});

Then(/^I should see on the Yoroi withdrawal transfer summary screen:$/, async function (table) {
  const rows = table.hashes();
  await checkWithdrawalAddressesRecoveredAreCorrect(rows, this);
  await checkTotalAmountIsCorrect(rows, this);
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
