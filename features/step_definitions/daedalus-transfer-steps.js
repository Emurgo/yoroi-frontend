// @flow

import { Before, Given, When, Then, After } from 'cucumber';
import { By } from 'selenium-webdriver';
import {
  getMockServer,
  closeMockServer
} from '../mock-chain/mockServer';
import {
  getMockWebSocketServer,
  closeMockWebSocketServer,
  mockRestoredDaedalusAddresses
} from '../mock-chain/mockWebSocketServer';
import {
  navigateTo,
  waitUntilUrlEquals
} from '../support/helpers/route-helpers';
import i18n from '../support/helpers/i18n-helpers';
import {
  checkAddressesRecoveredAreCorrect,
  checkTotalAmountIsCorrect
} from '../support/helpers/transfer-helpers';

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
  await navigateTo.call(this, '/transfer/daedalus');
  await waitUntilUrlEquals.call(this, '/transfer/daedalus');
  await this.waitForElement('.transferInstructionsPageComponent');
});

When(/^I click on the create Yoroi wallet button$/, async function () {
  await this.click('.createYoroiWallet');
});

When(/^I click on the transfer funds from Daedalus button$/, async function () {
  await this.click('.fromDaedalusWallet');
});

When(/^I click on the transfer funds from Daedalus master key button$/, async function () {
  await this.click('.fromDaedalusMasterKey');
});

When(/^I proceed with the recovery$/, async function () {
  await this.click('.proceedTransferButtonClasses');
});

When(/^I click next button on the Daedalus transfer page$/, async function () {
  await this.click("//button[contains(@label, 'Next')]", By.xpath);
});

When(/^I click the back button$/, async function () {
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
  await this.waitForElement('.WalletAdd_component');
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
  await checkAddressesRecoveredAreCorrect(rows, this);
  await checkTotalAmountIsCorrect(rows, this);
});

Then(/^I see all necessary elements on "TRANSFER FUNDS FROM DAEDALUS" screen:$/, async function () {
  const textCreateYoroiWallet = await this.intl('transfer.instructions.instructions.button.label');
  const textDaedalusWallet = await this.intl('daedalusTransfer.instructions.attention.button.label');
  const textDaedalusPaperWallet = await this.intl('daedalusTransfer.instructions.attention.paper.button.label');
  const textDaedalusMasterKey = await this.intl('daedalusTransfer.instructions.attention.masterKey.button.label');

  await this.waitForElement(`//button[contains(@class, 'createYoroiWallet') and contains(text(), '${textCreateYoroiWallet}')]`, By.xpath);
  await this.waitForElement(`//button[contains(@class, 'fromDaedalusWallet') and contains(text(), '${textDaedalusWallet}')]`, By.xpath);
  await this.waitForElement(`//button[contains(@class, 'fromDaedalusPaperWallet') and contains(text(), '${textDaedalusPaperWallet}')]`, By.xpath);
  await this.waitForElement(`//button[contains(@class, 'fromDaedalusMasterKey') and contains(text(), '${textDaedalusMasterKey}')]`, By.xpath);
});
