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

When(/^I enter the recovery phrase:$/, async function (table) {
  const fields = table.hashes()[0];
  const recoveryPhrase = fields.recoveryPhrase.split(' ');
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const word = recoveryPhrase[i];
    await this.input('.AutocompleteOverrides_autocompleteWrapper input', word);
    await this.click(`//li[contains(text(), '${word}')]`, By.xpath);
  }
});

When(/^I enter one more word to the recovery phrase field:$/, async function (table) {
  const words = table.hashes()[0];
  await this.input('.AutocompleteOverrides_autocompleteWrapper input', words.word);
  const lastWord = await this.driver.findElements(By.xpath(`//span[contains(text(), '${words.word}')]`));
  expect(lastWord.length).to.be.equal(0);
});

When(/^I clear the recovery phrase$/, async function () {
  await this.clearInputUpdatingForm('.AutocompleteOverrides_autocompleteWrapper input', 15);
});

When(/^I enter the restored wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input('#walletPassword--4', fields.password);
  await this.input('#repeatPassword--5', fields.repeatedPassword);
});

When(/^I clear the restored wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm('#walletPassword--4', password.length);
});

When(/^I click the "Restore Wallet" button$/, async function () {
  await this.click('.WalletRestoreDialog .primary');
});

Then(/^I should see an "Invalid recovery phrase" error message$/, async function () {
  await this.waitForElement('.SimpleAutocomplete_errored');
});

Then(/^I should stay in the restore wallet dialog$/, async function () {
  const restoreMessage = await i18n.formatMessage(this.driver, { id: 'wallet.restore.dialog.title.label' });
  await this.waitUntilText('.Dialog_title', restoreMessage.toUpperCase(), 2000);
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
  const errorSelector = '.AutocompleteOverrides_autocompleteWrapper .SimpleFormField_error';
  await checkErrorByTranslationId(this, errorSelector, error);
});

Then(/^I don't see last word of ([^"]*) in recovery phrase field$/, async function (table) {
  const words = table.split(' ');
  const lastWord = words[words.length - 1];
  await this.waitForElementNotPresent(`//span[contains(@class, 'SimpleAutocomplete') and contains(text(), "${lastWord}")]`, By.xpath);
});
