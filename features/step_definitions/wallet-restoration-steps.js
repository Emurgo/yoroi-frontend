// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';
import { expect } from 'chai';

async function checkErrorByTranslationId(client, errorSelector, error) {
  await client.waitUntilText(errorSelector, await client.intl(error.message));
}

When(/^I click the restore button$/, async function () {
  await this.click('.restoreWalletButton');
});

When(/^I click the restore paper wallet button$/, async function () {
  await this.click('.restorePaperWalletButton');
});

When(/^I enter the recovery phrase:$/, async function (table) {
  const fields = table.hashes()[0];
  const recoveryPhrase = fields.recoveryPhrase.split(' ');
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const word = recoveryPhrase[i];
    await this.input('.AutocompleteOverridesClassic_autocompleteWrapper input', word);
    await this.click(`//li[contains(text(), '${word}')]`, By.xpath);
  }
});

When(/^I enter the master key:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input('input[name="masterKey"]', fields.masterKey);
});

When(/^I enter one more word to the recovery phrase field:$/, async function (table) {
  const words = table.hashes()[0];
  await this.input('.AutocompleteOverridesClassic_autocompleteWrapper input', words.word);
  const lastWord = await this.driver.findElements(By.xpath(`//span[contains(text(), '${words.word}')]`));
  expect(lastWord.length).to.be.equal(0);
});

When(/^I clear the recovery phrase$/, async function () {
  await this.clearInputUpdatingForm('.AutocompleteOverridesClassic_autocompleteWrapper input', 15);
});

When(/^I enter the restored wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input("input[name='walletPassword']", fields.password);
  await this.input("input[name='repeatPassword']", fields.repeatedPassword);
});

Then(/^I repeat the wallet password "([^"]*)"$/, async function (password) {
  await this.input("input[name='repeatPassword']", password);
});

When(/^I enter the paper wallet password "([^"]*)"$/, async function (password) {
  await this.input("input[name='paperPassword']", password);
});

When(/^I clear the restored wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm("input[name='walletPassword']", password.length);
});

When(/^I click the "Restore Wallet" button$/, async function () {
  await this.click('.WalletRestoreDialog .primary');
});

Then(/^I should see an "Invalid recovery phrase" error message$/, async function () {
  await this.waitForElement('.SimpleAutocomplete_errored');
});

Then(/^I should see a plate ([^"]*)$/, async function (plate) {
  const plateElement = await this.driver.findElements(By.css('.WalletRestoreVerifyDialog_plateIdSpan'));
  const plateText = await plateElement[0].getText();
  expect(plateText).to.be.equal(plate);
});

Then(/^I should stay in the restore wallet dialog$/, async function () {
  const restoreMessage = await i18n.formatMessage(this.driver, { id: 'wallet.restore.dialog.title.label' });
  await this.waitUntilText('.Dialog_titleClassic', restoreMessage.toUpperCase(), 2000);
});

Then(/^I delete recovery phrase by pressing "x" signs$/, async function () {
  const webElements = await this.driver.findElements(By.xpath(`//span[contains(text(), '×')]`));
  for (let i = 0; i < webElements.length; i++) {
    await this.click(`(//span[contains(text(), '×')])[1]`, By.xpath);
  }
  const expectedElements = await this.driver.findElements(By.xpath(`//span[contains(text(), '×')]`));
  
  expect(expectedElements.length).to.be.equal(0);
});

Then(/^I should see an "Invalid recovery phrase" error message:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.AutocompleteOverridesClassic_autocompleteWrapper .SimpleFormField_error';
  await checkErrorByTranslationId(this, errorSelector, error);
});

Then(/^I don't see last word of ([^"]*) in recovery phrase field$/, async function (table) {
  const words = table.split(' ');
  const lastWord = words[words.length - 1];
  await this.waitForElementNotPresent(`//span[contains(@class, 'SimpleAutocomplete') and contains(text(), "${lastWord}")]`, By.xpath);
});

Then(/^I should see an "X words left" error message:$/, async function (data) {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'wallet.restore.dialog.form.errors.shortRecoveryPhrase', values: { number: 1 } });
  const errorSelector = '.AutocompleteOverridesClassic_autocompleteWrapper .SimpleFormField_error';
  await this.waitUntilText(errorSelector, errorMessage);
});
