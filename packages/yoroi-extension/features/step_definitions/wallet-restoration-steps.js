// @flow

import { When, Then } from 'cucumber';
import { Key, error } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';
import { expect } from 'chai';
import { checkErrorByTranslationId, checkWalletPlate } from './common-steps';
import {
  cleanRecoverInput,
  clearAllButton,
  confirmButton,
  enterRecoveryPhrase,
  getAllRecoverPhraseInputs,
  getRecoveryPhraseInput,
  mnemonicErrorText,
  nextButton,
  restorePageTitle,
  restoreWalletInputPhraseDialog,
  validPhraseText,
} from '../pages/restoreWalletPage';
import { masterKeyInput } from '../pages/walletClaimTransferPage';
import {
  recoveryPhraseError,
  restoreNormalWallet,
  walletAlreadyExistsComponent,
  restoreWalletButton,
} from '../pages/newWalletPages';
import { infoDialog, infoDialogContinueButton } from '../pages/commonDialogPage';
import {
  repeatPasswordInput,
  walletPasswordInput,
  walletNameInput,
} from '../pages/walletDetailsPage';

const getTextFromAllInputs = async customWorld => {
  const resultArray = [];
  const allInputs = await getAllRecoverPhraseInputs(customWorld);
  for (const inputElement of allInputs) {
    const inputText = await inputElement.getText();
    if (inputText) {
      resultArray.push(inputText);
    }
  }

  return resultArray;
};

Then(/^I select 15-word wallet$/, async function () {
  await this.waitForElement(restoreNormalWallet);
  await this.click(restoreNormalWallet);
});

When(/^I enter the recovery phrase:$/, async function (table) {
  this.webDriverLogger.info(`Step: I enter the recovery phrase`);
  const fields = table.hashes()[0];
  await this.waitForElement(restoreWalletInputPhraseDialog);
  await enterRecoveryPhrase(this, fields.recoveryPhrase);
  await this.waitForElement(validPhraseText);
  await this.click(nextButton);
});

When(/^I enter the recovery phrase, not clicking next:$/, async function (table) {
  this.webDriverLogger.info(`Step: I enter the recovery phrase`);
  const fields = table.hashes()[0];
  await this.waitForElement(restoreWalletInputPhraseDialog);
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
  this.webDriverLogger.info(`Step: I clear the recovery phrase`);
  await this.clearInputUpdatingForm(cleanRecoverInput, 15);
});

When(/^I enter the restored wallet details:$/, async function (table) {
  this.webDriverLogger.info(`Step: I enter the restored wallet details`);
  // info modal window
  await this.waitForElement(infoDialog);
  await this.click(infoDialogContinueButton);
  // entering a wallet info
  const fields = table.hashes()[0];
  await this.input(walletNameInput, fields.walletName);
  await this.input(walletPasswordInput, fields.password);
  await this.input(repeatPasswordInput, fields.repeatPassword);
});

Then(/^I click the "Restore" button$/, async function () {
  this.webDriverLogger.info(`Step: I click the "Restore" button`);
  await this.click(nextButton);
});

const nextButtonIsDisabled = async (customWorld: any) => {
  await customWorld.waitForElement(nextButton);
  const pointerValue = await customWorld.getCssValue(nextButton, 'pointer-events');
  expect(pointerValue).to.be.equal('none');
}

Then(/^I see the "Restore" button is disabled$/, async function () {
  await nextButtonIsDisabled(this);
});

Then(/^I see the "Next" button is disabled$/, async function () {
  await nextButtonIsDisabled(this);
});

Then(/^I repeat the wallet password "([^"]*)"$/, async function (password) {
  await this.input(repeatPasswordInput, password);
});

When(/^I clear the restored wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm(walletPasswordInput, password.length);
});

When(/^I click the "Restore Wallet" button$/, async function () {
  await this.click(restoreWalletButton);
});

Then(/^I should see an "Invalid recovery phrase" error message$/, async function () {
  await this.driver.sleep(500);
  const errorObject = { message: 'wallet.restore.thirdStep.incorrectRecoveryPhrase' };
  expect(await this.isDisplayed(mnemonicErrorText)).to.be.true;
  await checkErrorByTranslationId(this, mnemonicErrorText, errorObject);
});

Then(/^I should see a plate ([^"]*)$/, async function (plate) {
  await checkWalletPlate(this, plate);
});

Then(/^I should stay in the restore wallet dialog$/, async function () {
  const restoreMessage = await i18n.formatMessage(this.driver, {
    id: 'wallet.add.page.revamp.restoreWallet',
  });
  await this.waitUntilText(restorePageTitle, restoreMessage, 2000);
});

Then(/^I delete recovery phrase by clicking "Clear all"$/, async function () {
  // click Clear all button
  await this.waitForElement(clearAllButton);
  await this.click(clearAllButton);
  // check that all recovery inputs are empty
  const resultArray = await getTextFromAllInputs(this);
  expect(resultArray.length).to.be.equal(0);
});

Then(/^I delete recovery phrase$/, async function () {
  // click on every recovery phrase and send the DELETE button
  for (let index = 0; index < 15; index++) {
    const recoveryInput = getRecoveryPhraseInput(index);
    await this.click(recoveryInput);
    await this.input(recoveryInput, Key.DELETE);
  }
  // check that all recovery inputs are empty
  const resultArray = await getTextFromAllInputs(this);
  expect(resultArray.length).to.be.equal(0);
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
