// @flow

import { When, Given, Then } from 'cucumber';
import i18n from '../support/helpers/i18n-helpers';
import { By, Key } from 'selenium-webdriver';
import { truncateLongName, } from '../../app/utils/formatters';

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
  const errorSelector = '.ChangeWalletPasswordDialog_newPasswordClassic .SimpleFormField_error';
  await checkErrorByTranslationId(this, errorSelector, error);
});

Then(/^I should see "Doesn't match" error message:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.SimpleFormField_error';
  await checkErrorByTranslationId(this, errorSelector, error);
});

Then(/^I should see the following submit error messages:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.ChangeWalletPasswordDialog_error';
  await checkErrorByTranslationId(this, errorSelector, error);
});

async function checkErrorByTranslationId(client, errorSelector, error) {
  await client.waitUntilText(errorSelector, await client.intl(error.message));
}

Then(/^I should stay in the change password dialog$/, async function () {
  const changePasswordMessage = await i18n.formatMessage(this.driver,
    { id: 'wallet.settings.changePassword.dialog.title.changePassword' });
  await this.waitUntilText('.Dialog_title', changePasswordMessage.toUpperCase(), 2000);
});

Then(/^I should see support screen$/, async function () {
  await this.waitForElement("//h1[contains(text(), 'Frequently asked questions')]", By.xpath);
  await this.waitForElement("//h1[contains(text(), 'Reporting a problem')]", By.xpath);
  await this.waitForElement("//h1[contains(text(), 'Logs')]", By.xpath);
});

When(/^I click on remove wallet$/, async function () {
  await this.click('.removeWallet');
});

Then(/^I click on the checkbox$/, async function () {
  await this.click('.DangerousActionDialog_checkbox > .SimpleCheckbox_root');
});

Then(/^I should see a no wallet message$/, async function () {
  await this.waitForElement('.NoWalletMessage_component');
});


Then(/^I sleep for ([^"]*)$/, async function (ms) {
  await this.driver.sleep(Number.parseInt(ms, 10));
});
