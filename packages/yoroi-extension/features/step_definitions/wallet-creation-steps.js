// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';
import { expect } from 'chai';
import { checkErrorByTranslationId } from './common-steps';
import {
  clearButton,
  createWalletButton,
  createWalletPasswordError,
  recoveryPhraseButton,
  recoveryPhraseConfirmButton,
  securityWarning,
  seedPhrasePlaceholder,
  walletRecoveryPhraseMnemonicComponent,
} from '../pages/newWalletPages';
import { continueButton } from '../pages/basicSetupPage';
import { dialogTitle, infoDialog, infoDialogContinueButton } from '../pages/commonDialogPage';
import { addAdditionalWalletButton } from '../pages/walletPage';
import {
  addWalletDetailsBox,
  createWalletNameError,
  createWalletWarning,
  createWalletPasswordHelperText,
  enterFullRecoveryPhrase,
  getFullRecoveryPhrase,
  getRecoveryPhraseWord,
  isValidPhraseMessage,
  nextButton,
  recoveryPhraseBox,
  toggleRecoveryPhraseBlurButton,
  verifyRecoveryPhraseBox,
  createWalletRepeatPasswordHelperText,
} from '../pages/createWalletPage';
import {
  walletNameInput,
  walletPasswordInput,
  repeatPasswordInput,
  newWalletDialogPlate,
} from '../pages/walletDetailsPage';

When(/^I click the create button$/, async function () {
  await this.click(createWalletButton);
});

When(/^I see Create Wallet warning step and continue$/, async function () {
  this.webDriverLogger.info(`Step: I see Create Wallet warning step and continue`);
  await this.waitForElement(createWalletWarning);
  await this.click(nextButton);
});

When(/^I see Recovery Phrase step and remember it$/, async function () {
  this.webDriverLogger.info(`Step: I see Recovery Phrase step and remember it`);
  // info modal window
  await this.waitForElement(infoDialog);
  await this.click(infoDialogContinueButton);
  // step 2
  await this.waitForElement(recoveryPhraseBox);
  // checking for blurring
  const singleWordLocator = getRecoveryPhraseWord(0);
  const wordCssValueBlured = await this.getCssValue(singleWordLocator, 'filter');
  expect(wordCssValueBlured).to.include('blur');
  await this.click(toggleRecoveryPhraseBlurButton);
  const wordCssValueUnblured = await this.getCssValue(singleWordLocator, 'filter');
  expect(wordCssValueUnblured).to.equal('none');
  // "remembering" the phrase
  const fullPhrase = await getFullRecoveryPhrase(this);
  await this.saveToLocalStorage('recoveryPhrase', fullPhrase);
  // next
  await this.click(nextButton);
});

When(/^I repeat the recovery phrase$/, async function () {
  this.webDriverLogger.info(`Step: I enter the recovery phrase`);
  // step 3
  await this.waitForElement(verifyRecoveryPhraseBox);
  const savedRecoveryPhrase = await this.getFromLocalStorage('recoveryPhrase');
  // entering the phrase
  await enterFullRecoveryPhrase(this, savedRecoveryPhrase);
  // the phrase is verified and correct
  const isValidMessageHidden =
    (await this.getCssValue(isValidPhraseMessage, 'visibility')) === 'hidden';
  expect(isValidMessageHidden).to.be.false;
  // click next
  await this.click(nextButton);
});

When(/^I enter wallet details:$/, async function (table) {
  this.webDriverLogger.info(`Step: I enter wallet details:`);
  // step 4
  await this.waitForElement(addWalletDetailsBox);
  // info modal window
  await this.waitForElement(infoDialog);
  await this.click(infoDialogContinueButton);
  const fields = table.hashes()[0];
  // enter wallet name
  await this.input(walletNameInput, fields.walletName);
  // enter wallet password
  await this.input(walletPasswordInput, fields.password);
  // repeat wallet password
  await this.input(repeatPasswordInput, fields.repeatedPassword);
  // check wallet plate is displayed
  await this.waitForElement(newWalletDialogPlate);
});

When(/^I enter the created wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input(walletPasswordInput, fields.password);
  await this.input(repeatPasswordInput, fields.repeatedPassword);
});

When(/^I clear the created wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm(walletPasswordInput, password.length);
});

When(/^I click the "Create" button$/, async function () {
  this.webDriverLogger.info(`Step: I click the "Create" button`);
  await this.click(nextButton, 2);
});

Then(/^I should see the invalid password error message:$/, async function (data) {
  this.webDriverLogger.info(`Step: I should see the invalid password error message`);
  const error = data.hashes()[0];
  await this.waitForElement(createWalletPasswordHelperText);
  await checkErrorByTranslationId(this, createWalletPasswordHelperText, error);
});

Then(/^I should see the invalid repeat password error message:$/, async function (data) {
  this.webDriverLogger.info(`Step: I should see the invalid repeat password error message`);
  const error = data.hashes()[0];
  await this.waitForElement(createWalletRepeatPasswordHelperText);
  await checkErrorByTranslationId(this, createWalletRepeatPasswordHelperText, error);
});

Then(/^I see the Create button is disabled$/, async function () {
  this.webDriverLogger.info(`Step: I see the Create button is disabled`);
  const createButton = await this.findElement(nextButton);
  const buttonState = await createButton.isEnabled();
  expect(buttonState).to.be.false;
});

When(/^I accept the creation terms$/, async function () {
  const privacyDlg = await this.driver.findElement(
    By.xpath('//div[contains(@class,"WalletBackupPrivacyWarningDialog_component")]')
  );
  const privacyChkbox = privacyDlg.findElement(By.xpath('//input[@type="checkbox"]'));
  await privacyChkbox.click();
  await this.click(continueButton);
});

When(/^I copy and enter the displayed mnemonic phrase$/, async function () {
  const mnemonicElement = await this.waitElementTextMatches(
    /^.*$/,
    walletRecoveryPhraseMnemonicComponent
  );

  const mnemonic = await mnemonicElement.getText();
  await this.click(recoveryPhraseButton);
  const recoveryPhrase = mnemonic.split(' ');
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const word = recoveryPhrase[i];

    // same word can occur many times, so we look for any copy of the desired word still unselected
    await this.click({
      locator:
        "(//button[contains(@class,'MnemonicWord_component') " + // any word
        ` and (text() = '${word}')])`,
      method: 'xpath',
    });
  }
  const checkboxes = await this.driver.findElements(
    By.xpath("//input[contains(@class,'PrivateSwitchBase-input')]")
  );
  checkboxes.forEach(box => box.click());
  await this.click(recoveryPhraseConfirmButton);
});

When(/^I enter random mnemonic phrase$/, async function () {
  await this.click(recoveryPhraseButton);
  for (let i = 15; i > 1; i--) {
    await this.click(getRecoveryPhraseWord(i));
  }
  const allWordsComponentText = await this.getText(walletRecoveryPhraseMnemonicComponent);
  expect(allWordsComponentText).to.not.equal(seedPhrasePlaceholder);
});

Then(/^I click Clear button$/, async function () {
  await this.click(clearButton);
});

Then(/^I see All selected words are cleared$/, async function () {
  await this.waitUntilText(walletRecoveryPhraseMnemonicComponent, seedPhrasePlaceholder, 5000);
});

Then(/^I should stay in the create wallet dialog$/, async function () {
  const createMessage = await i18n.formatMessage(this.driver, { id: 'wallet.create.dialog.title' });
  await this.waitUntilText(dialogTitle, createMessage.toUpperCase(), 2000);
});

Then(/^I should see the invalid wallet name error message:$/, async function (data) {
  const error = data.hashes()[0];
  await this.waitForElement(createWalletNameError);
  await checkErrorByTranslationId(this, createWalletNameError, error);
});

Then(/^I should see "Invalid Password" error message:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(this, createWalletPasswordError, error);
});

Then(/^I see the security warning prior:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(this, securityWarning, error);
});

Then(/^I click to add an additional wallet$/, async function () {
  await this.click(addAdditionalWalletButton);
});
