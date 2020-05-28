// @flow

import { When, Then, } from 'cucumber';
import { testWallets } from '../mock-chain/TestWallets';

When(/^I restore a Ledger device$/, async function () {
  await this.click('.WalletAdd_btnConnectHW');

  await this.waitForElement('.PickCurrencyOptionDialog');
  await this.click('.PickCurrencyOptionDialog_cardano');

  await this.waitForElement('.WalletConnectHWOptionDialog');

  await this.click('.WalletConnectHWOptionDialog_connectLedger');
  await this.waitForElement('.CheckDialog_component');
  await this.click('.primary');
  await this.click('.primary');

  // between these is where the tab & iframe gets opened

  await this.waitForElement('.SaveDialog');
  await this.click('.primary');
});

When(/^I restore a Trezor device$/, async function () {
  await this.click('.WalletAdd_btnConnectHW');

  await this.waitForElement('.PickCurrencyOptionDialog');
  await this.click('.PickCurrencyOptionDialog_cardano');

  await this.waitForElement('.WalletConnectHWOptionDialog');

  await this.click('.WalletConnectHWOptionDialog_connectTrezor');
  await this.waitForElement('.CheckDialog_component');
  await this.click('.primary');
  await this.click('.primary');

  // between these is where the tab & iframe gets opened

  await this.waitForElement('.SaveDialog');
  await this.input("input[name='walletName']", testWallets['trezor-wallet'].name);
  await this.click('.primary');
});


When(/^I see the hardware send money confirmation dialog$/, async function () {
  await this.waitForElement('.HWSendConfirmationDialog_dialog');
});

When(/^I click on the verify address button$/, async function () {
  await this.click('.WalletReceive_verifyActionBlock');
});

When(/^I see the verification address "([^"]*)"$/, async function (address) {
  await this.waitUntilText('.verificationAddress', address);
});

When(/^I see the derivation path "([^"]*)"$/, async function (path) {
  await this.waitUntilText('.VerifyAddressDialog_derivation', path);
});

Then(/^I verify the address on my ledger device$/, async function () {
  await this.click('.Dialog_actions .primary');
  await this.waitDisable('.Dialog_actions .primary'); // disable when communicating with device
  await this.waitEnable('.Dialog_actions .primary'); // enable after it's done
  await this.waitForElementNotPresent('.ErrorBlock_component');
});

Then(/^I verify the address on my trezor device$/, async function () {
  await this.click('.Dialog_actions .primary');
  // we should have this disable while the action is processing, but we don't show a spinner on this
  await this.waitForElementNotPresent('.ErrorBlock_component');
});
