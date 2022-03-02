// @flow

import { When, Then, } from 'cucumber';
import { testWallets } from '../mock-chain/TestWallets';
import { truncateAddress, } from '../../app/utils/formatters';

When(/^I select a Byron-era Ledger device$/, async function () {
  await this.click('.WalletAdd_btnConnectHW');

  await this.waitForElement('.PickCurrencyOptionDialog');
  await this.click('.PickCurrencyOptionDialog_cardano');

  await this.waitForElement('.WalletConnectHWOptionDialog');

  await this.click('.WalletConnectHWOptionDialog_connectLedger');
  await this.click('.WalletEraOptionDialog_bgByronMainnet');
});
When(/^I select a Shelley-era Ledger device$/, async function () {
  await this.click('.WalletAdd_btnConnectHW');

  await this.waitForElement('.PickCurrencyOptionDialog');
  await this.click('.PickCurrencyOptionDialog_cardano');

  await this.waitForElement('.WalletConnectHWOptionDialog');

  await this.click('.WalletConnectHWOptionDialog_connectLedger');
  await this.click('.WalletEraOptionDialog_bgShelleyMainnet');
});
When(/^I restore the Ledger device$/, async function () {
  await this.waitForElement('.CheckDialog_component');
  await this.click('.primary');
  await this.click('.primary');

  // between these is where the tab & iframe gets opened

  await this.waitForElement('.SaveDialog');
  await this.click('.primary');
});


When(/^I select a Byron-era Trezor device$/, async function () {
  await this.click('.WalletAdd_btnConnectHW');

  await this.waitForElement('.PickCurrencyOptionDialog');
  await this.click('.PickCurrencyOptionDialog_cardano');

  await this.waitForElement('.WalletConnectHWOptionDialog');

  await this.click('.WalletConnectHWOptionDialog_connectTrezor');
  await this.click('.WalletEraOptionDialog_bgByronMainnet');
});
When(/^I select a Shelley-era Trezor device$/, async function () {
  await this.click('.WalletAdd_btnConnectHW');

  await this.waitForElement('.PickCurrencyOptionDialog');
  await this.click('.PickCurrencyOptionDialog_cardano');

  await this.waitForElement('.WalletConnectHWOptionDialog');

  await this.click('.WalletConnectHWOptionDialog_connectTrezor');
  await this.click('.WalletEraOptionDialog_bgShelleyMainnet');
});

When(/^I restore the Trezor device$/, async function () {
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
  await this.click('.WalletReceive_verifyIcon');
});

When(/^I see the verification address "([^"]*)"$/, async function (address) {
  await this.waitUntilText('.verificationAddress', truncateAddress(address));
});

When(/^I see the derivation path "([^"]*)"$/, async function (path) {
  await this.waitUntilText('.VerifyAddressDialog_derivation', path);
});

Then(/^I verify the address on my ledger device$/, async function () {
  await this.click('.VerifyAddressDialog_component .primary');
  await this.waitDisable('.VerifyAddressDialog_component .primary'); // disable when communicating with device
  await this.waitEnable('.VerifyAddressDialog_component .primary'); // enable after it's done
  await this.driver.sleep(1000);
  await this.waitForElementNotPresent('.ErrorBlock_component');
});

Then(/^I verify the address on my trezor device$/, async function () {
  await this.click('.Dialog_actions .primary');
  // we should have this disable while the action is processing, but we don't show a spinner on this
  await this.waitForElementNotPresent('.ErrorBlock_component');
});
