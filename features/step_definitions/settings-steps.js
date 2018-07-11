import { When, Given, Then } from 'cucumber';
import { expect } from 'chai';

const walletNameInputSelector = '.WalletSettings_component .walletName input';

Given(/^I should see the "([^"]*)" wallet password dialog$/, function (dialogType) {
  const selector = '.' + dialogType + 'PasswordDialog';
  return this.waitForElement(selector);
});

When(/^I click on "name" input field$/, async function () {
  await this.click('.WalletSettings_component .InlineEditingInput_component');
});

When(/^I enter new wallet name:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.clearInput(walletNameInputSelector);
  await this.input(walletNameInputSelector, fields.name);
});

When(/^I click outside "name" input field$/, async function () {
  await this.click('.WalletSettings_component');
});

When(/^I click on the "([^"]*)" password label$/, function (label) {
  const selector = '.' + label + 'Label button';
  return this.click(selector);
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
  return this
    .driver
    .wait(async() => {
      const updatedName = await this.getText('.TopBar_walletName');
      return walletName.toUpperCase() === updatedName;
    });
});

Then(/^I should see the following error messages:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.ChangeWalletPasswordDialog_newPassword .SimpleFormField_error';
  await checkError(this, errorSelector, error);
});

Then(/^I should see the following submit error messages:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.ChangeWalletPasswordDialog_error';
  await checkError(this, errorSelector, error);
});

async function checkError(client, errorSelector, error) {
  await client.waitForElement(errorSelector);
  const errorsOnScreen = await client.getText(errorSelector);
  const expectedError = await client.intl(error.message);
  expect(errorsOnScreen).to.equal(expectedError);
}

Then(/^I should stay in the change password dialog$/, async function () {
  await this.waitUntilText('.Dialog_title', 'CHANGE PASSWORD', 2000);
});

