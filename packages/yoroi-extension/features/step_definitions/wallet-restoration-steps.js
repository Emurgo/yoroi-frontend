// @flow

import { When, Then } from 'cucumber';
import { By, error } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';
import { expect } from 'chai';
import { checkErrorByTranslationId, checkWalletPlate } from './common-steps';
import {
  cleanRecoverInput,
  enterRecoveryPhrase,
  confirmButton,
  errorInvalidRecoveryPhrase,
  restoreWalletInputPhraseDialog,
} from '../pages/restoreWalletPage';
import { masterKeyInput } from '../pages/walletClaimTransferPage';
import {
  recoveryPhraseDeleteIcon,
  recoveryPhraseError,
  restoreDialogButton,
  restoreNormalWallet,
  shelleyEraButton,
  walletAlreadyExistsComponent,
} from '../pages/newWalletPages';
import { dialogTitle } from '../pages/commonDialogPage';
import { repeatPasswordInput, walletPasswordInput } from '../pages/walletDetailsPage';

Then(/^I select Shelley-era 15-word wallet$/, async function () {
  await this.click(restoreNormalWallet);
  await this.click(shelleyEraButton);
  await this.waitForElement(restoreWalletInputPhraseDialog);
});

When(/^I enter the recovery phrase:$/, async function (table) {
  const fields = table.hashes()[0];
  await enterRecoveryPhrase(this, fields.recoveryPhrase);
});

When(/^I can't enter more then 15 words from the recovery phrase:$/, async function (table) {
  const fields = table.hashes()[0];
  let result = false;
  try {
    await enterRecoveryPhrase(this, fields.recoveryPhrase);
  } catch (e) {
    if (e instanceof error.ElementNotInteractableError) {
      result = true;
    } else {
      throw e;
    }
  }

  expect(result).to.be.true;
});

When(/^I enter the master key:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input(masterKeyInput, fields.masterKey);
});

When(/^I clear the recovery phrase$/, async function () {
  await this.clearInputUpdatingForm(cleanRecoverInput, 15);
});

When(/^I enter the restored wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input(walletPasswordInput, fields.password);
  await this.input(repeatPasswordInput, fields.repeatedPassword);
});

Then(/^I repeat the wallet password "([^"]*)"$/, async function (password) {
  await this.input(repeatPasswordInput, password);
});

When(/^I clear the restored wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm(walletPasswordInput, password.length);
});

When(/^I click the "Restore Wallet" button$/, async function () {
  await this.click(restoreDialogButton);
});

Then(/^I should see an "Invalid recovery phrase" error message$/, async function () {
  await this.driver.sleep(500);
  expect(await this.isDisplayed(errorInvalidRecoveryPhrase)).to.be.true;
});

Then(/^I should see a plate ([^"]*)$/, async function (plate) {
  await checkWalletPlate(this, plate);
});

Then(/^I should stay in the restore wallet dialog$/, async function () {
  const restoreMessage = await i18n.formatMessage(this.driver, {
    id: 'wallet.restore.dialog.title.label',
  });
  await this.waitUntilText(dialogTitle, restoreMessage.toUpperCase(), 2000);
});

Then(/^I delete recovery phrase by clicking "x" signs$/, async function () {
  const webElements = await this.driver.findElements(By.xpath(`//span[contains(text(), '×')]`));
  for (let i = 0; i < webElements.length; i++) {
    await this.click(recoveryPhraseDeleteIcon);
  }
  const expectedElements = await this.driver.findElements(
    By.xpath(`//span[contains(text(), '×')]`)
  );

  expect(expectedElements.length).to.be.equal(0);
});

Then(/^I should see an "Invalid recovery phrase" error message:$/, async function (data) {
  const expectedError = data.hashes()[0];
  await checkErrorByTranslationId(this, recoveryPhraseError, expectedError);
});

Then(/^I don't see last word of ([^"]*) in recovery phrase field$/, async function (table) {
  const words = table.split(' ');
  const lastWord = words[words.length - 1];
  await this.waitForElementNotPresent({
    locator: `//span[contains(@class, 'SimpleAutocomplete') and contains(text(), "${lastWord}")]`,
    method: 'xpath',
  });
});

// eslint-disable-next-line no-unused-vars
Then(/^I should see an "(\d{1,2}) words left" error message:$/, async function (number, data) {
  const expectedError = data.hashes()[0];
  await this.driver.sleep(1000);
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: expectedError.message,
    values: { number: Number(number) },
  });
  await this.waitUntilText(recoveryPhraseError, errorMessage, 15000);
});

Then(/^I should see the wallet already exist window$/, async function () {
  await this.waitForElement(walletAlreadyExistsComponent);
});

When(/^I click the Open wallet button$/, async function () {
  await this.click(confirmButton);
});
