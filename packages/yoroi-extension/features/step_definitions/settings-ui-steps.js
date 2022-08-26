// @flow

import { When, Given, Then } from 'cucumber';
import i18n from '../support/helpers/i18n-helpers';
import { By, Key } from 'selenium-webdriver';
import { truncateLongName, } from '../../app/utils/formatters';
import { expect } from 'chai';
import { checkErrorByTranslationId } from './common-steps';
import { walletNameText } from '../pages/walletPage';

const walletNameInputSelector = '.SettingsLayout_settingsPane .walletName input';

Given(/^I should see the "([^"]*)" wallet password dialog$/, async function (dialogType) {
  const selector = '.' + dialogType + 'PasswordDialog';
  await this.waitForElement({ locator: selector, method: 'css' });
});

When(/^I click on "name" input field$/, async function () {
  await this.click({ locator: '.SettingsLayout_settingsPane .InlineEditingInput_component', method: 'css' });
});

When(/^I enter new wallet name:$/, async function (table) {
  const fields = table.hashes()[0];
  /* Unfortunately in Selenium on geckodriver, JS events fire strangely on input fields
   * For example, onFocus, etc. can transfer between clear() (or other things) and sendKeys(key)
   * This makes our InlineEditingInput become disabled causing the clear and sendKeys to fail
   * https://github.com/seleniumhq/selenium-google-code-issue-archive/issues/214
   * We instead repeatedly delete characters until we've deleted the whole name
  */

  // can't programmatically get the wallet name due to the issue above
  // so assume max length
  const maxNameLength = 40;
  for (let i = 0; i < maxNameLength; i++) {
    // Chrome and Firefox select the text field starting at the left / right respectively
    await this.input({ locator: walletNameInputSelector, method: 'css' }, Key.BACK_SPACE); // Firefox
    await this.input({ locator: walletNameInputSelector, method: 'css' }, Key.DELETE); // Chrome
  }
  await this.input({ locator: walletNameInputSelector, method: 'css' }, fields.name);
});

Then(/^I should see the "Terms of use" screen$/, async function () {
  await this.waitForElement({ locator: '#terms-of-service-agreement', method: 'css' });
});

When(/^I click outside "name" input field$/, async function () {
  await this.click({ locator: '.SettingsLayout_settingsPane', method: 'css' });
});

When(/^I click on the "([^"]*)" password label$/, async function (label) {
  const selector = '.' + label + 'Label button';
  await this.click({ locator: selector, method: 'css' });
});

When(/^I change wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input({ locator: '.changePasswordDialog .currentPassword input', method: 'css' }, fields.currentPassword);
  await this.input({ locator: '.changePasswordDialog .newPassword input', method: 'css' }, fields.password);
  await this.input({ locator: '.changePasswordDialog .repeatedPassword input', method: 'css' }, fields.repeatedPassword);
});

When(/^I clear the current wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm({ locator: '.changePasswordDialog .currentPassword input', method: 'css' }, password.length);
});

When(/^I clear the current wallet repeat password ([^"]*)$/, async function (repeatPassword) {
  await this.clearInputUpdatingForm({ locator: '.changePasswordDialog .repeatedPassword input', method: 'css' }, repeatPassword.length);
});

When(/^I submit the wallet password dialog$/, async function () {
  await this.click({ locator: '.confirmButton', method: 'css' });
});

When(/^I click the next button$/, async function () {
  await this.click({ locator: '.confirmButton', method: 'css' });
});

Then(/^I should not see the change password dialog anymore$/, async function () {
  await this.waitForElementNotPresent({ locator: '.changePasswordDialog', method: 'css' });
});

Then(/^I should see new wallet name "([^"]*)"$/, async function (walletName) {
  await this.waitUntilText(walletNameText, truncateLongName(walletName));
});

Then(/^I should see the following error messages:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(
    this,
    { locator: '//p[starts-with(@id, "walletPassword--") and contains(@id, "-helper-text")]', method: 'xpath' },
    error);
});

Then(/^I should see "Doesn't match" error message:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(
    this,
    { locator: '.MuiFormHelperText-root', method: 'css' },
    error);
});

Then(/^I should see the following submit error messages:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(
    this,
    { locator: '.ChangeWalletPasswordDialog_error', method: 'css' },
    error);
});

Then(/^I should stay in the change password dialog$/, async function () {
  const changePasswordMessage = await i18n.formatMessage(this.driver,
    { id: 'wallet.settings.changePassword.dialog.title.changePassword' });
  await this.waitUntilText({ locator: '.dialog__title', method: 'css' }, changePasswordMessage.toUpperCase(), 2000);
});

Then(/^I should see support screen$/, async function () {
  await this.waitForElement({ locator: "//h1[contains(text(), 'Frequently asked questions')]", method: 'xpath' });
  await this.waitForElement({ locator: "//h1[contains(text(), 'Reporting a problem')]", method: 'xpath' });
  await this.waitForElement({ locator: "//h1[contains(text(), 'Logs')]", method: 'xpath' });
});

Then(/^I should see blockchain screen$/, async function () {
  await this.waitForElement({ locator: '.ExplorerSettings_component', method: 'css' });
  await this.waitForElement({ locator: "//h2[contains(text(), 'Cardano Payment URLs')]", method: 'xpath' });
  await this.waitForElement({ locator: "//h2[contains(text(), 'Currency Conversion')]", method: 'xpath' });
});

When(/^I click on remove wallet$/, async function () {
  await this.click({ locator: '.removeWallet', method: 'css' });
});

When(/^I click on resync wallet$/, async function () {
  await this.click({ locator: '.resyncButton', method: 'css' });
});

When(/^I click on export wallet$/, async function () {
  await this.click({ locator: '.exportWallet', method: 'css' });
});

Then(/^I should see the wallet export for key "([^"]*)"$/, async function (expectedKey) {
  await this.waitForElement({ locator: '.ExportPublicKeyDialog_component', method: 'css' });
  const publicKeyForm = await this.driver.findElement(By.css('.CodeBlock_component'));
  const publicKey = await publicKeyForm.getText();
  expect(publicKey).to.equal(expectedKey);
});

Then(/^I click on the checkbox$/, async function () {
  const warningCheckboxElement = await this.driver.findElement(By.css('.DangerousActionDialog_checkbox'));
  const checkbox = await warningCheckboxElement.findElement(By.xpath('//input[@type="checkbox"]'));
  await checkbox.click();
});

Then(/^I should see a no wallet message$/, async function () {
  const noWalletMessage = await i18n.formatMessage(
    this.driver,
    { id: 'wallet.nowallet.title' }
  );
  await this.waitUntilText({ locator: '.FullscreenMessage_title', method: 'css' }, noWalletMessage);
});

Then(/^I sleep for ([^"]*)$/, async function (ms) {
  await this.driver.sleep(Number.parseInt(ms, 10));
});

Then(/^I should see "Incorrect wallet password." error message$/, async function(){
  const errorSelector = '.ChangeWalletPasswordDialog_error';
  await this.waitUntilText(
    { locator: errorSelector, method: 'css' },
    'Incorrect wallet password.',
    15000
  );
});