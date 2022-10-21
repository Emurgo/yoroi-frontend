// @flow

import { When, Given, Then } from 'cucumber';
import i18n from '../support/helpers/i18n-helpers';
import { Key } from 'selenium-webdriver';
import { truncateLongName } from '../../app/utils/formatters';
import { expect } from 'chai';
import { checkErrorByTranslationId } from './common-steps';
import { walletNameText } from '../pages/walletPage';
import {
  changePasswordDialog,
  changePasswordDialogError,
  confirmButton,
  currentPasswordInput,
  explorerSettingsDropdown,
  helperText,
  newPasswordInput,
  repeatPasswordInput,
  walletNameInput,
  walletNameInputSelector,
  walletPasswordHelperText,
  walletSettingsPane,
  faqTitle,
  logsTitle,
  reportingAProblemTitle,
  cardanoPaymentsURLTitle,
  currencyConversionText,
  removeWalletButton,
  resyncWalletButton,
  exportButton,
  exportPublicKeyDialog,
  fullScreenMessage,
  exportPublicKeyText,
} from '../pages/settingsPage';
import { dialogTitle, getWarningCheckbox } from '../pages/commonDialogPage';

Given(/^I should see the "([^"]*)" wallet password dialog$/, async function (dialogType) {
  const selector = '.' + dialogType + 'PasswordDialog';
  await this.waitForElement({ locator: selector, method: 'css' });
});

When(/^I click on "name" input field$/, async function () {
  await this.click(walletNameInput);
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
    await this.input(walletNameInputSelector, Key.BACK_SPACE); // Firefox
    await this.input(walletNameInputSelector, Key.DELETE); // Chrome
  }
  await this.input(walletNameInputSelector, fields.name);
});

Then(/^I should see the "Terms of use" screen$/, async function () {
  await this.waitForElement({ locator: '#terms-of-service-agreement', method: 'css' });
});

When(/^I click outside "name" input field$/, async function () {
  await this.click(walletSettingsPane);
});

When(/^I click on the "([^"]*)" password label$/, async function (label) {
  const selector = '.' + label + 'Label button';
  await this.click({ locator: selector, method: 'css' });
});

When(/^I change wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input(currentPasswordInput, fields.currentPassword);
  await this.input(newPasswordInput, fields.password);
  await this.input(repeatPasswordInput, fields.repeatedPassword);
});

When(/^I clear the current wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm(currentPasswordInput, password.length);
});

When(/^I clear the current wallet repeat password ([^"]*)$/, async function (repeatPassword) {
  await this.clearInputUpdatingForm(repeatPasswordInput, repeatPassword.length);
});

When(/^I submit the wallet password dialog$/, async function () {
  await this.click(confirmButton);
});

When(/^I click the next button$/, async function () {
  await this.click(confirmButton);
});

Then(/^I should not see the change password dialog anymore$/, async function () {
  await this.waitForElementNotPresent(changePasswordDialog);
});

Then(/^I should see new wallet name "([^"]*)"$/, async function (walletName) {
  await this.waitUntilText(walletNameText, truncateLongName(walletName));
});

Then(/^I should see the following error messages:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(this, walletPasswordHelperText, error);
});

Then(/^I should see "Doesn't match" error message:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(this, helperText, error);
});

Then(/^I should see the following submit error messages:$/, async function (data) {
  const error = data.hashes()[0];
  await checkErrorByTranslationId(this, changePasswordDialogError, error);
});

Then(/^I should stay in the change password dialog$/, async function () {
  const changePasswordMessage = await i18n.formatMessage(this.driver, {
    id: 'wallet.settings.changePassword.dialog.title.changePassword',
  });
  await this.waitUntilText(dialogTitle, changePasswordMessage.toUpperCase(), 2000);
});

Then(/^I should see support screen$/, async function () {
  await this.waitForElement(faqTitle);
  await this.waitForElement(reportingAProblemTitle);
  await this.waitForElement(logsTitle);
});

Then(/^I should see blockchain screen$/, async function () {
  await this.waitForElement(explorerSettingsDropdown);
  await this.waitForElement(cardanoPaymentsURLTitle);
});

When(/^I click on remove wallet$/, async function () {
  await this.click(removeWalletButton);
});

When(/^I click on resync wallet$/, async function () {
  await this.click(resyncWalletButton);
});

When(/^I click on export wallet$/, async function () {
  await this.click(exportButton);
});

Then(/^I should see the wallet export for key "([^"]*)"$/, async function (expectedKey) {
  await this.waitForElement(exportPublicKeyDialog);
  const publicKey = await this.getText(exportPublicKeyText);
  expect(publicKey).to.equal(expectedKey);
});

Then(/^I click on the checkbox$/, async function () {
  const checkbox = await getWarningCheckbox(this);
  await checkbox.click();
});

Then(/^I should see a no wallet message$/, async function () {
  const noWalletMessage = await i18n.formatMessage(this.driver, { id: 'wallet.nowallet.title' });
  await this.waitUntilText(fullScreenMessage, noWalletMessage);
});

Then(/^I sleep for ([^"]*)$/, async function (ms) {
  await this.driver.sleep(Number.parseInt(ms, 10));
});

Then(/^I should see "Incorrect wallet password." error message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'api.errors.IncorrectPasswordError' });
  await this.waitUntilText(changePasswordDialogError, errorMessage);
});
