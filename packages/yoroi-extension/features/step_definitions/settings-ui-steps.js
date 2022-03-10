// @flow

import { When, Given, Then } from 'cucumber';
import i18n from '../support/helpers/i18n-helpers';
import { By, Key } from 'selenium-webdriver';
import { truncateLongName, } from '../../app/utils/formatters';
import { expect } from 'chai';
import { checkErrorByTranslationId } from './common-steps';

const walletNameInputSelector = '.SettingsLayout_settingsPane .walletName input';

Given(/^I should see the "([^"]*)" wallet password dialog$/, async function (dialogType) {
  const selector = '.' + dialogType + 'PasswordDialog';
  await this.waitForElement(selector);
});

When(/^I click on "name" input field$/, async function () {
  await this.click('.SettingsLayout_settingsPane .InlineEditingInput_component');
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
  await this.waitForElement('#terms-of-service-agreement');
});

When(/^I click outside "name" input field$/, async function () {
  await this.click('.SettingsLayout_settingsPane');
});

When(/^I click on the "([^"]*)" password label$/, async function (label) {
  const selector = '.' + label + 'Label button';
  await this.click(selector);
});

When(/^I change wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input('.changePasswordDialog .currentPassword input', fields.currentPassword);
  await this.input('.changePasswordDialog .newPassword input', fields.password);
  await this.input('.changePasswordDialog .repeatedPassword input', fields.repeatedPassword);
});

When(/^I clear the current wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm('.changePasswordDialog .currentPassword input', password.length);
});

When(/^I clear the current wallet repeat password ([^"]*)$/, async function (repeatPassword) {
  await this.clearInputUpdatingForm('.changePasswordDialog .repeatedPassword input', repeatPassword.length);
});

When(/^I submit the wallet password dialog$/, async function () {
  await this.click('.confirmButton');
});

When(/^I click the next button$/, async function () {
  await this.click('.confirmButton');
});

Then(/^I should not see the change password dialog anymore$/, async function () {
  await this.waitForElementNotPresent('.changePasswordDialog');
});

Then(/^I should see new wallet name "([^"]*)"$/, async function (walletName) {
  await this.waitUntilText('.NavPlate_name', truncateLongName(walletName));
});

Then(/^I should see the following error messages:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '//p[starts-with(@id, "walletPassword--") and contains(@id, "-helper-text")]';
  await checkErrorByTranslationId(this, errorSelector, error, By.xpath);
});

Then(/^I should see "Doesn't match" error message:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.MuiFormHelperText-root';
  await checkErrorByTranslationId(this, errorSelector, error);
});

Then(/^I should see the following submit error messages:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.ChangeWalletPasswordDialog_error';
  await checkErrorByTranslationId(this, errorSelector, error);
});

Then(/^I should stay in the change password dialog$/, async function () {
  const changePasswordMessage = await i18n.formatMessage(this.driver,
    { id: 'wallet.settings.changePassword.dialog.title.changePassword' });
  await this.waitUntilText('.dialog__title', changePasswordMessage.toUpperCase(), 2000);
});

Then(/^I should see support screen$/, async function () {
  await this.waitForElement("//h1[contains(text(), 'Frequently asked questions')]", By.xpath);
  await this.waitForElement("//h1[contains(text(), 'Reporting a problem')]", By.xpath);
  await this.waitForElement("//h1[contains(text(), 'Logs')]", By.xpath);
});

Then(/^I should see blockchain screen$/, async function () {
  await this.waitForElement('.ExplorerSettings_component');
  await this.waitForElement("//h2[contains(text(), 'Cardano Payment URLs')]", By.xpath);
  await this.waitForElement("//h2[contains(text(), 'Currency Conversion')]", By.xpath);
});

When(/^I click on remove wallet$/, async function () {
  await this.click('.removeWallet');
});

When(/^I click on resync wallet$/, async function () {
  await this.click('.resyncButton');
});

When(/^I click on export wallet$/, async function () {
  await this.click('.exportWallet');
});

Then(/^I should see the wallet export for key "([^"]*)"$/, async function (expectedKey) {
  await this.waitForElement('.ExportPublicKeyDialog_component');
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
  await this.waitUntilText('.FullscreenMessage_title', noWalletMessage);
});

Then(/^I sleep for ([^"]*)$/, async function (ms) {
  await this.driver.sleep(Number.parseInt(ms, 10));
});

Then(/^I should see "Incorrect wallet password." error message$/, async function(){
  const errorSelector = '.ChangeWalletPasswordDialog_error';
  await this.waitUntilText(errorSelector, 'Incorrect wallet password.', 15000);
});