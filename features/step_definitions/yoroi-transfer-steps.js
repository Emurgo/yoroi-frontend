// @flow

import { Given, When, Then } from 'cucumber';
import BigNumber from 'bignumber.js';
import {
  navigateTo,
  waitUntilUrlEquals
} from '../support/helpers/route-helpers';
import i18n from '../support/helpers/i18n-helpers';
import {
  checkAddressesRecoveredAreCorrect,
  checkTotalAmountIsCorrect
} from '../support/helpers/transfer-helpers';
import {
  signedTransactionHandler,
  utxoForAddressesHook,
} from '../mock-chain/mockServer';

Given(/^I am on the Yoroi Transfer start screen$/, async function () {
  await navigateTo.call(this, '/transfer/yoroi');
  await waitUntilUrlEquals.call(this, '/transfer/yoroi');
  await this.waitForElement('.yoroiTransferStartPageComponent');
});

When(/^I click on the next button on the Yoroi Transfer start screen$/, async function () {
  await this.click('.next');
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

When(/^I confirm Yoroi transfer funds$/, async function () {
  await this.click('.transferButton');
});

Then(/^I should see the Yoroi transfer success screen$/, async function () {
  const successPageTitle = await i18n.formatMessage(this.driver,
    { id: 'yoroiTransfer.successPage.title' });
  await this.waitUntilText('.SuccessPage_title', successPageTitle.toUpperCase());
});

Then(/^I should see the next button on the Yoroi transfer start screen disabled$/, async function () {
  await this.waitDisable('.YoroiTransferStartPage_button.next');
});

Then(/^I should see the "CREATE YOROI WALLET" button disabled$/, async function () {
  await this.waitDisable('.createYoroiWallet.YoroiTransferStartPage_button');
});

Then(/^I transfer some Ada out of the source wallet$/, async (table) => {
  const { fromAddress, amount } = table.hashes()[0];
  // Next request to /api/txs/signed should fail
  signedTransactionHandler.push((req, res) => {
    res.status(500);
    // Mimicking the backend behavior
    res.send({ code: 'Internal', message: 'Error trying to connect with importer' });
  });
  utxoForAddressesHook.push(utxos => utxos.map(utxo => {
    if (utxo.receiver === fromAddress) {
      return Object.assign(utxo, { amount:
        new BigNumber(utxo.amount).minus(new BigNumber(amount)).toString() });
    }
    return utxo;
  }));
});

Then(/^I should see wallet changed notice$/, async function () {
  const walletChangedError = await i18n.formatMessage(this.driver,
    { id: 'yoroiTransfer.error.walletChangedError' });
  await this.waitUntilText('.TransferSummaryPage_error', walletChangedError);
});
