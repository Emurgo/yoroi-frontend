import { When, Given, Then } from 'cucumber';
import i18n from '../support/helpers/i18n-helpers';

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
  await this.clearInput(walletNameInputSelector);
  await this.clearInput(walletNameInputSelector);
  await this.input(walletNameInputSelector, fields.name);
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

When(/^I submit the wallet password dialog$/, async function () {
  await this.click('.confirmButton');
});

Then(/^I should not see the change password dialog anymore$/, async function () {
  await this.waitForElementNotPresent('.changePasswordDialog');
});

Then(/^I should see new wallet name "([^"]*)"$/, async function (walletName) {
  await this.waitUntilText('.TopBar_walletName', walletName.toUpperCase());
});

Then(/^I should see the following error messages:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.ChangeWalletPasswordDialog_newPassword .SimpleFormField_error';
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

