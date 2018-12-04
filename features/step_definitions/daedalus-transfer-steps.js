// @flow

import { Before, Given, When, Then, After } from 'cucumber';
import { By } from 'selenium-webdriver';
import BigNumber from 'bignumber.js';
import {
  LOVELACES_PER_ADA,
  DECIMAL_PLACES_IN_ADA
} from '../../app/config/numbersConfig';
import {
  getMockServer,
  closeMockServer
} from '../support/mockServer';
import {
  getMockWebSocketServer,
  closeMockWebSocketServer,
  mockRestoredDaedalusAddresses
} from '../support/mockWebSocketServer';
import {
  navigateTo,
  waitUntilUrlEquals
} from '../support/helpers/route-helpers';
import i18n from '../support/helpers/i18n-helpers';

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

async function checkErrorByTranslationId(client, errorSelector, error) {
  await client.waitUntilText(errorSelector, await client.intl(error.message));
}

Given(/^My Daedalus wallet has funds/, () => {
  const daedalusAddresses = [
    'DdzFFzCqrhstBgE23pfNLvukYhpTPUKgZsXWLN5GsawqFZd4Fq3aVuGEHk11LhfMfmfBCFCBGrdZHVExjiB4FY5Jkjj1EYcqfTTNcczb',
    'DdzFFzCqrht74dr7DYmiyCobGFQcfLCsHJCCM6nEBTztrsEk5kwv48EWKVMFU9pswAkLX9CUs4yVhVxqZ7xCVDX1TdatFwX5W39cohvm'
  ];
  mockRestoredDaedalusAddresses(daedalusAddresses);
});

Given(/^My Daedalus wallet hasn't funds/, () => {
  const daedalusAddresses = [];
  mockRestoredDaedalusAddresses(daedalusAddresses);
});

Given(/^I am on the Daedalus Transfer instructions screen$/, async function () {
  await navigateTo.call(this, '/daedalus-transfer');
  await waitUntilUrlEquals.call(this, '/daedalus-transfer');
  await this.waitForElement('.transferInstructionsPageComponent');
});

When(/^I click on the create Yoroi wallet button$/, async function () {
  await this.click('.instructionsButton');
});

When(/^I click on the transfer funds from Daedalus button$/, async function () {
  await this.click('.confirmButton');
});

When(/^I proceed with the recovery$/, async function () {
  await this.click('.proceedTransferButtonClasses');
});

When(/^I click next button on the Daedalus transfer page$/, async function () {
  await this.click("//button[contains(@label, 'Next')]", By.xpath);
});

When(/^I click back button on the Daedalus transfer page$/, async function () {
  await this.click("//button[contains(@label, 'Back')]", By.xpath);
});

Then(/^I should see "This field is required." error message:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.SimpleFormField_error';
  await checkErrorByTranslationId(this, errorSelector, error);
});

When(/^I confirm Daedalus transfer funds$/, async function () {
  await this.click('.transferButton');
});

Then(/^I should see the Create wallet screen$/, async function () {
  const createWalletTitle = await i18n.formatMessage(this.driver,
    { id: 'wallet.add.page.title' });
  await this.waitUntilText('.StaticTopbarTitle_topbarTitleText', createWalletTitle.toUpperCase());
});

Then(/^I should see the Receive screen$/, async function () {
  const receiveTitle = await i18n.formatMessage(this.driver,
    { id: 'wallet.navigation.receive' });
  await this.waitUntilText('.WalletNavButton_active', receiveTitle.toUpperCase());
});

Then(/^I should see an Error screen$/, async function () {
  const errorPageTitle = await i18n.formatMessage(this.driver,
    { id: 'daedalusTransfer.errorPage.title.label' });
  await this.waitUntilText('.ErrorPage_title', errorPageTitle);
});

Then(/^I should see 'Connection lost' error message$/, async function () {
  const errorDescription = await i18n.formatMessage(this.driver,
    { id: 'daedalusTransfer.error.webSocketRestoreError' });
  await this.waitUntilText('.ErrorPage_error', errorDescription);
});

Then(/^I should see 'Daedalus wallet without funds' error message$/, async function () {
  const errorDescription = await i18n.formatMessage(this.driver,
    { id: 'api.errors.noInputsError' });
  await this.waitUntilText('.ErrorPage_error', errorDescription);
});

Then(/^I should wait until funds are recovered:$/, async function (table) {
  const rows = table.hashes();
  await _checkDaedalusAddressesRecoveredAreCorrect(rows, this);
  await _checkTotalAmountIsCorrect(rows, this);
});

Then(/^I see all necessary elements on "TRANSFER FUNDS FROM DAEDALUS" screen:$/, async function (table) {
  const messages = table.hashes()[0];
  const instructionMessage = await this.intl(messages.instructionMessage);
  const attentionMessage = await this.intl(messages.attentionMessage);
  await this.waitForElement(`//div[@class='TransferInstructionsPage_text' and contains(text(), '${instructionMessage}')]`, By.xpath);
  await this.waitForElement(`//div[contains(text(), 'Attention')]//following::div[@class='TransferInstructionsPage_text' and contains(text(), '${attentionMessage}')]`, By.xpath);
  await this.waitForElement(`//button[contains(@class, 'disabled') and contains(text(), 'Create Yoroi wallet')]`, By.xpath); // Disabled "Create yoroi" button
  await this.waitForElement(`//button[contains(@class, 'confirmButton') and contains(text(), 'Transfer all funds from Daedalus wallet')]`, By.xpath);
});

async function _checkDaedalusAddressesRecoveredAreCorrect(rows, world) {
  const waitUntilDaedalusAddressesRecoveredAppeared = rows.map((row, index) => (
    world.waitUntilText(
      `.addressRecovered-${index + 1}`,
      row.daedalusAddress
    )
  ));
  await Promise.all(waitUntilDaedalusAddressesRecoveredAppeared);
}

async function _checkTotalAmountIsCorrect(rows, world) {
  const totalAmount = rows.reduce(
    (acc, row) => acc.plus(new BigNumber(row.amount)), new BigNumber(0)
  );
  const totalAmountFormated = `${totalAmount
    .dividedBy(LOVELACES_PER_ADA)
    .toFormat(DECIMAL_PLACES_IN_ADA)} ADA`;
  await world.waitUntilText(
    '.TransferSummaryPage_amount',
    totalAmountFormated
  );
}
