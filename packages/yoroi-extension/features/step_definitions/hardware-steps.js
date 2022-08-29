// @flow

import { When, Then } from 'cucumber';
import { testWallets } from '../mock-chain/TestWallets';
import { truncateAddress } from '../../app/utils/formatters';
import { addressField, derivationField, verifyButton } from '../pages/verifyAddressPage';
import { expect } from 'chai';
import {
  byronEraButton,
  checkDialog,
  connectHwButton,
  hwOptionsDialog,
  ledgerWalletButton,
  pickUpCurrencyDialog,
  pickUpCurrencyDialogCardano,
  saveDialog,
  sendConfirmationDialog,
  shelleyEraButton,
  trezorWalletButton,
} from '../pages/newWalletPages';
import { errorBlockComponent, primaryButton } from '../pages/commonDialogPage';
import { walletNameInput } from '../pages/restoreWalletPage';
import { verifyAddressButton, verifyAddressHWButton } from '../pages/walletReceivePage';

When(/^I select a Byron-era Ledger device$/, async function () {
  await this.click(connectHwButton);

  await this.waitForElement(pickUpCurrencyDialog);
  await this.click(pickUpCurrencyDialogCardano);

  await this.waitForElement(hwOptionsDialog);

  await this.click(ledgerWalletButton);
  await this.click(byronEraButton);
});
When(/^I select a Shelley-era Ledger device$/, async function () {
  await this.click(connectHwButton);

  await this.waitForElement(pickUpCurrencyDialog);
  await this.click(pickUpCurrencyDialogCardano);

  await this.waitForElement(hwOptionsDialog);

  await this.click(ledgerWalletButton);
  await this.click(shelleyEraButton);
});
When(/^I restore the Ledger device$/, async function () {
  await this.waitForElement(checkDialog);
  await this.click(primaryButton);
  await this.click(primaryButton);

  // between these is where the tab & iframe gets opened

  await this.waitForElement(saveDialog);
  await this.click(primaryButton);
});

When(/^I select a Byron-era Trezor device$/, async function () {
  await this.click(connectHwButton);

  await this.waitForElement(pickUpCurrencyDialog);
  await this.click(pickUpCurrencyDialogCardano);

  await this.waitForElement(hwOptionsDialog);

  await this.click(trezorWalletButton);
  await this.click(byronEraButton);
});
When(/^I select a Shelley-era Trezor device$/, async function () {
  await this.click(connectHwButton);

  await this.waitForElement(pickUpCurrencyDialog);
  await this.click(pickUpCurrencyDialogCardano);

  await this.waitForElement(hwOptionsDialog);

  await this.click(trezorWalletButton);
  await this.click(shelleyEraButton);
});

When(/^I restore the Trezor device$/, async function () {
  await this.waitForElement(checkDialog);
  await this.click(primaryButton);
  await this.click(primaryButton);

  // between these is where the tab & iframe gets opened

  await this.waitForElement(saveDialog);
  await this.input(walletNameInput, testWallets['trezor-wallet'].name);
  await this.click(primaryButton);
});

When(/^I see the hardware send money confirmation dialog$/, async function () {
  await this.waitForElement(sendConfirmationDialog);
});

When(/^I click on the verify address button$/, async function () {
  // wait until all addresses are loaded
  await this.driver.sleep(1000);
  const allVerifyAddressButtons = await this.findElements(verifyAddressButton);
  await allVerifyAddressButtons[0].click();
});

When(/^I see the verification address "([^"]*)"$/, async function (expectAddress) {
  await this.waitForElement(addressField);
  const actualAddressStr = await this.getText(addressField);
  expect(actualAddressStr).to.equal(
    truncateAddress(expectAddress),
    `The actual verification address is different from expected.`
  );
});

When(/^I see the derivation path "([^"]*)"$/, async function (path) {
  await this.waitUntilText(derivationField, path);
});

Then(/^I verify the address on my ledger device$/, async function () {
  await this.click(verifyAddressHWButton);
  await this.waitDisable(verifyAddressHWButton); // disable when communicating with device
  await this.waitEnable(verifyAddressHWButton); // enable after it's done
  await this.driver.sleep(1000);
  await this.waitForElementNotPresent(errorBlockComponent);
});

Then(/^I verify the address on my trezor device$/, async function () {
  await this.click(verifyButton);
  // we should have this disable while the action is processing, but we don't show a spinner on this
  await this.waitForElementNotPresent(errorBlockComponent);
});
