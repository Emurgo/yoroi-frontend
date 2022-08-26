// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';
import { expect, assert } from 'chai';
import { checkErrorByTranslationId } from './common-steps';
import {
  createWalletButton,
  getCurrencyButton,
  pickUpCurrencyDialog
} from '../pages/newWalletPages';
import { continueButton } from '../pages/basicSetupPage';

When(/^I click the create button$/, async function () {
  await this.click(createWalletButton);
});

When(/^I select the currency ([^"]*)$/, async function (currency) {
  await this.waitForElement(pickUpCurrencyDialog);
  await this.click(getCurrencyButton(currency));
});

When(/^I select Create Wallet$/, async function () {
  await this.waitForElement(pickUpCurrencyDialog);
  await this.click(createWalletButton);
});
When(/^I select Paper Wallet$/, async function () {
  await this.waitForElement({ locator: '.WalletCreateOptionDialog', method: 'css' });
  await this.click({ locator: '.WalletCreateOptionDialog_restorePaperWallet', method: 'css' });
});

When(/^I enter the created wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input({ locator: '.WalletCreateDialog .walletPassword input', method: 'css' }, fields.password);
  await this.input({ locator: '.WalletCreateDialog .repeatedPassword input', method: 'css' }, fields.repeatedPassword);
});

When(/^I clear the created wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm({ locator: '.WalletCreateDialog .walletPassword input', method: 'css' }, password.length);
});

When(/^I click the "Create personal wallet" button$/, async function () {
  await this.click({ locator: '.WalletCreateDialog .primary', method: 'css' });
});

Then(/^I should see the invalid password error message:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(
    this,
    { locator: '//p[starts-with(@id, "walletPassword") and contains(@id, "-helper-text")]', method: 'xpath' },
    error);
});

Then(/^I see the submit button is disabled$/, async function () {
  const dialogElement = await this.driver.findElement(By.xpath('//div[contains(@class, "Dialog")]'));
  const disabledButton = await dialogElement.findElement(By.xpath('.//button[contains(@class, "primary")]'));
  const buttonState = await disabledButton.isEnabled();
  expect(buttonState).to.be.false;
});

When(/^I accept the creation terms$/, async function () {
  const privacyDlg = await this.driver.findElement(
    By.xpath('//div[contains(@class,"WalletBackupPrivacyWarningDialog_component")]')
  );
  const privacyChkbox = privacyDlg.findElement(By.xpath('//input[@type="checkbox"]'));
  privacyChkbox.click();
  await this.click(continueButton);
});

When(/^I copy and enter the displayed mnemonic phrase$/, async function () {
  const mnemonicElement = await this.waitElementTextMatches(
    /^.*$/,
    { locator: '.WalletRecoveryPhraseMnemonic_component', method: 'css' }
  );

  const mnemonic = await mnemonicElement.getText();
  await this.click({ locator: '.WalletRecoveryPhraseDisplayDialog .primary', method: 'css' });
  const recoveryPhrase = mnemonic.split(' ');
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const word = recoveryPhrase[i];

    // same word can occur many times, so we look for any copy of the desired word still unselected
    await this.click({
      locator: "(//button[contains(@class,'MnemonicWord_component') " + // any word
        ` and (text() = '${word}')])`,
      method: 'xpath' });
  }
  const checkboxes = await this.driver.findElements(
    By.xpath("//input[contains(@class,'PrivateSwitchBase-input')]")
  );
  checkboxes.forEach(box => box.click());
  await this.click({ locator: '//button[text()="Confirm"]', method: 'xpath' });
});

When(/^I enter random mnemonic phrase$/, async function () {
  await this.click({ locator: '.WalletRecoveryPhraseDisplayDialog .primary', method: 'css' });
  for (let i = 15; i > 1; i--) {
    await this.click({
      locator: `//div[@class='WalletRecoveryPhraseEntryDialog_words']//button[${i}]`,
      method: 'xpath' });
  }
  const words = await this.driver.findElement(By.css('.WalletRecoveryPhraseMnemonic_component'));
  words
    .getText()
    .then(text => expect(text).to.not.equal(''))
    .catch(err => assert.fail(err.message));
});

Then(/^I click Clear button$/, async function () {
  await this.click({ locator: "//button[contains(text(), 'Clear')]", method: 'xpath' });
});

Then(/^I see All selected words are cleared$/, async function () {
  await this.waitUntilText({ locator: '.WalletRecoveryPhraseMnemonic_component', method: 'css' }, '', 5000);
});

Then(/^I should stay in the create wallet dialog$/, async function () {
  const createMessage = await i18n.formatMessage(this.driver, { id: 'wallet.create.dialog.title' });
  await this.waitUntilText({ locator: '.dialog__title', method: 'css' }, createMessage.toUpperCase(), 2000);
});

Then(
  /^I should see "Wallet name requires at least 1 and at most 40 letters." error message:$/,
  async function (data) {
    const error = data.hashes()[0];
    await checkErrorByTranslationId(
      this,
      { locator: '.walletName .MuiFormHelperText-root', method: 'css' },
      error);
  }
);

Then(/^I should see "Invalid Password" error message:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(
    this,
    { locator: '.FormFieldOverridesClassic_error', method: 'css' },
    error);
});

Then(/^I see the security warning prior:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(
    this,
    { locator: '.MuiFormControlLabel-root', method: 'css' },
    error);
});

Then(/^I click to add an additional wallet$/, async function () {
  await this.click({ locator: `.NavBar_navbar .NavBar_content .MuiButton-primary`, method: 'css' });
});
