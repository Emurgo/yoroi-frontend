// @flow

import { Before, Given, When, Then, After } from 'cucumber';
import { getMockServer, closeMockServer } from '../mock-chain/mockCardanoServer';
import {
  getMockWebSocketServer,
  closeMockWebSocketServer,
  mockRestoredDaedalusAddresses,
} from '../mock-chain/mockWebSocketServer';
import i18n from '../support/helpers/i18n-helpers';
import {
  checkAddressesRecoveredAreCorrect,
  checkTotalAmountIsCorrect,
} from '../support/helpers/transfer-helpers';
import { checkErrorByTranslationId } from './common-steps';
import { daedalusMasterKeyButton, twelveWordOption } from '../pages/walletClaimTransferPage';
import { proceedRecoveryButton } from '../pages/restoreWalletPage';
import { errorMessage, errorPageTitle } from '../pages/errorPage';
import { amountField, feeField, totalAmountField } from '../pages/confirmTransactionPage';
import { walletAddComponent } from '../pages/basicSetupPage';
import {
  backButton,
  formFieldOverridesClassicError,
  nextButton,
  transferButton,
} from '../pages/daedalusTransferPage';
import { activeNavTab } from '../pages/walletPage';

Before({ tags: '@withWebSocketConnection' }, () => {
  closeMockServer();
  const newMockServer = getMockServer({});
  getMockWebSocketServer(newMockServer);
});

After({ tags: '@withWebSocketConnection' }, () => {
  closeMockServer();
  closeMockWebSocketServer();

  getMockServer({});
});

Given(/^My Daedalus wallet has funds/, () => {
  const daedalusAddresses = [
    'DdzFFzCqrhstBgE23pfNLvukYhpTPUKgZsXWLN5GsawqFZd4Fq3aVuGEHk11LhfMfmfBCFCBGrdZHVExjiB4FY5Jkjj1EYcqfTTNcczb',
    'DdzFFzCqrht74dr7DYmiyCobGFQcfLCsHJCCM6nEBTztrsEk5kwv48EWKVMFU9pswAkLX9CUs4yVhVxqZ7xCVDX1TdatFwX5W39cohvm',
  ];
  mockRestoredDaedalusAddresses(daedalusAddresses);
});

Given(/^My Daedalus wallet has no funds/, () => {
  const daedalusAddresses = [];
  mockRestoredDaedalusAddresses(daedalusAddresses);
});

Then(/^I select the 12-word option$/, async function () {
  await this.click(twelveWordOption);
});

When(/^I click on the transfer funds from Daedalus master key button$/, async function () {
  await this.click(daedalusMasterKeyButton);
});

When(/^I proceed with the recovery$/, async function () {
  await this.waitForElement(proceedRecoveryButton);
  await this.waitEnable(proceedRecoveryButton);
  await this.click(proceedRecoveryButton);
});

When(/^I click next button on the Daedalus transfer page$/, async function () {
  await this.click(nextButton);
});

When(/^I click the back button$/, async function () {
  await this.click(backButton);
});

Then(/^I should see "This field is required." error message:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(this, formFieldOverridesClassicError, error);
});

When(/^I confirm Daedalus transfer funds$/, async function () {
  await this.click(transferButton);
});

Then(/^I should see the Create wallet screen$/, async function () {
  await this.waitForElement(walletAddComponent);
});

Then(/^I should see the Receive screen$/, async function () {
  const receiveTitle = await i18n.formatMessage(this.driver, { id: 'wallet.navigation.receive' });
  await this.waitUntilText(activeNavTab, receiveTitle);
  await this.driver.sleep(2000);
});

Then(/^I should see an Error screen$/, async function () {
  const errorPageTitleString = await i18n.formatMessage(this.driver, {
    id: 'daedalusTransfer.errorPage.title.label',
  });
  await this.waitUntilText(errorPageTitle, errorPageTitleString);
});

Then(/^I should see 'Connection lost' error message$/, async function () {
  const errorDescription = await i18n.formatMessage(this.driver, {
    id: 'daedalusTransfer.error.webSocketRestoreError',
  });
  await this.waitUntilText(errorMessage, errorDescription);
});

Then(/^I should see 'Daedalus wallet without funds' error message$/, async function () {
  const errorDescription = await i18n.formatMessage(this.driver, {
    id: 'api.errors.noInputsError',
  });
  await this.waitUntilText(errorMessage, errorDescription);
});

Then(/^I should wait until funds are recovered:$/, async function (table) {
  const rows = table.hashes();
  await checkAddressesRecoveredAreCorrect(rows, this);
  await checkTotalAmountIsCorrect(rows, this);
});

When(/^I see transfer CONFIRM TRANSACTION Pop up:$/, async function (table) {
  const rows = table.hashes();
  const fields = rows[0];
  const totalRecoveredBalance = parseFloat(fields.amount) - parseFloat(fields.fee);
  await checkAddressesRecoveredAreCorrect(rows, this);
  await this.waitUntilContainsText(feeField, fields.fee);
  await this.waitUntilContainsText(amountField, fields.amount);
  await this.waitUntilContainsText(totalAmountField, totalRecoveredBalance);
});
