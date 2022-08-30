// @flow

import { Given, When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { navigateTo, waitUntilUrlEquals } from '../support/helpers/route-helpers';
import i18n from '../support/helpers/i18n-helpers';
import {
  checkAddressesRecoveredAreCorrect,
  checkFinalBalanceIsCorrect,
  checkWithdrawalAddressesRecoveredAreCorrect,
} from '../support/helpers/transfer-helpers';
import { claimTransferTab } from '../pages/walletPage';
import {
  byronButton,
  cancelTransferButton,
  descryptionPasswordInput,
  icarusTab,
  keyInput,
  shelleyPrivateKeyInput,
  restore15WordWalletIcarus,
  restoreShelley15WordDialog,
  restoreShelleyPaperWalletDialog,
  shelleyEraCard,
  restoreIcarusPaperWalletOption,
  transferSummaryPage,
  trezorOption,
  ledgerOption,
  yoroiPaperButton,
  transferErrorPageTitle,
  transferButton,
  transferSuccessPageTitle,
  createYoroiWalletButton,
  transferSummaryPageError,
  keepRegisteredButton,
  transferSummaryRefundText,
} from '../pages/walletClaimTransferPage';
import { primaryButton } from '../pages/commonDialogPage';
import { fullScreenMessage } from '../pages/settingsPage';
import { hardwareDisclaimerComponent, understandButton } from '../pages/walletDelegationPage';

async function confirmAttentionScreen(customWorld: Object) {
  // Attention screen
  await customWorld.waitForElement(hardwareDisclaimerComponent);
  const disclaimerClassElement = await customWorld.driver.findElement(
    By.css('.HardwareDisclaimer_component')
  );
  const checkbox = await disclaimerClassElement.findElement(By.xpath('//input[@type="checkbox"]'));
  await checkbox.click();
  await customWorld.click(understandButton);
}

Given(/^I am on the transfer start screen$/, async function () {
  await navigateTo.call(this, '/transfer');
  await waitUntilUrlEquals.call(this, '/transfer');
});

Given(/^Revamp. I go to the claim\/transfer page$/, async function () {
  await this.click(claimTransferTab);
});

When(/^I click skip the transfer$/, async function () {
  await this.click(cancelTransferButton);
});
When(/^I click on the shelley button on the transfer screen$/, async function () {
  await this.click(shelleyEraCard);
});
When(/^I click on the byron button on the transfer screen$/, async function () {
  await this.click(byronButton);
});
Then(/^I click on the icarus tab$/, async function () {
  await this.click(icarusTab);
});
Then(/^I select the Byron 15-word option$/, async function () {
  await this.click(restore15WordWalletIcarus);
});

Then(/^I select the Shelley 15-word option$/, async function () {
  await this.click(restoreShelley15WordDialog);
});
Then(/^I select the Shelley paper wallet option$/, async function () {
  await this.click(restoreShelleyPaperWalletDialog);
});
When(/^I enter the key "([^"]*)"$/, async function (password) {
  await this.input(keyInput, password);
});
When(/^I enter the decryption password "([^"]*)"$/, async function (password) {
  await this.input(descryptionPasswordInput, password);
});
Then(/^I select the private key option$/, async function () {
  await this.click(shelleyPrivateKeyInput);
});
Then(/^I select the yoroi paper wallet option$/, async function () {
  await this.click(restoreIcarusPaperWalletOption);
});
Then(/^I see the transfer transaction$/, async function () {
  await this.waitForElement(transferSummaryPage);
});
Then(/^I accept the prompt$/, async function () {
  await this.click(primaryButton);
});
Then(/^I select the trezor option$/, async function () {
  await this.click(trezorOption);
  // Attention screen
  await confirmAttentionScreen(this);
});
Then(/^I select the ledger option$/, async function () {
  await this.click(ledgerOption);
  // Attention screen
  await confirmAttentionScreen(this);
});
When(/^I click on the yoroiPaper button on the Yoroi Transfer start screen$/, async function () {
  await this.click(yoroiPaperButton);
});

Then(/^I should see the Yoroi transfer error screen$/, async function () {
  const errorPageTitle = await i18n.formatMessage(this.driver, {
    id: 'api.errors.generateTransferTxError',
  });
  await this.waitUntilText(transferErrorPageTitle, errorPageTitle);
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
  await this.click(transferButton);
});

Then(/^I should see the Yoroi transfer success screen$/, async function () {
  const successPageTitle = await i18n.formatMessage(this.driver, {
    id: 'yoroiTransfer.successPage.title',
  });
  await this.waitUntilText(transferSuccessPageTitle, successPageTitle.toUpperCase());
});

Then(/^I should see the transfer screen disabled$/, async function () {
  const noWalletMessage = await i18n.formatMessage(this.driver, { id: 'wallet.nowallet.title' });
  await this.waitUntilText(fullScreenMessage, noWalletMessage);
});

Then(/^I should see the "CREATE YOROI WALLET" button disabled$/, async function () {
  await this.waitDisable(createYoroiWalletButton);
});

Then(/^I should see wallet changed notice$/, async function () {
  const walletChangedError = await i18n.formatMessage(this.driver, {
    id: 'yoroiTransfer.error.walletChangedError',
  });
  await this.waitUntilText(transferSummaryPageError, walletChangedError);
});

When(/^I keep the staking key$/, async function () {
  await this.click(keepRegisteredButton);
});

Then(/^I see the deregistration for the transaction$/, async function () {
  await this.waitForElement(transferSummaryRefundText);
});

Then(/^I do not see the deregistration for the transaction$/, async function () {
  await this.waitForElementNotPresent(transferSummaryRefundText);
});
