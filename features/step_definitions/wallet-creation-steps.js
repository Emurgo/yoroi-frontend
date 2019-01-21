// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';
import { expect, assert } from 'chai';

async function checkErrorByTranslationId(client, errorSelector, error) {
  await client.waitUntilText(errorSelector, await client.intl(error.message));
}

When(/^I click the create button$/, async function () {
  await this.click('.createWalletButton');
});

When(/^I enter the created wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input('.WalletCreateDialog .walletPassword input', fields.password);
  await this.input('.WalletCreateDialog .repeatedPassword input', fields.repeatedPassword);
});

When(/^I clear the created wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm('.WalletCreateDialog .walletPassword input', password.length);
});

When(/^I click the "Create personal wallet" button$/, async function () {
  await this.click('.WalletCreateDialog .primary');
});

When(/^I accept the creation terms$/, async function () {
  await this.click('.SimpleCheckbox_check');
  await this.click('.WalletBackupPrivacyWarningDialog .primary');
});

When(/^I copy and enter the displayed mnemonic phrase$/, async function () {
  const mnemonicElement = await this.waitElementTextMatches(
    /^.*$/,
    '.WalletRecoveryPhraseMnemonic_component'
  );

  const mnemonic = await mnemonicElement.getText();
  await this.click('.WalletRecoveryPhraseDisplayDialog .primary');
  const recoveryPhrase = mnemonic.split(' ');
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const word = recoveryPhrase[i];
    await this.click(`(//button[contains(@class, 'MnemonicWord_root') and @label = '${word}'])[1]`, By.xpath);
  }
  const checkboxes = await this.driver.findElements(By.css('.SimpleCheckbox_check'));
  checkboxes.forEach((box) => box.click());
  await this.click('.WalletRecoveryPhraseEntryDialog .primary');
});

When(/^I enter random mnemonic phrase$/, async function () {
  await this.click('.WalletRecoveryPhraseDisplayDialog .primary');
  for (let i = 1; i < 16; i++) {
    await this.click(`//div[@class='WalletRecoveryPhraseEntryDialog_words']//button[${i}]`, By.xpath);
  }
  const words = await this.driver.findElement(By.xpath("//div[@class='WalletRecoveryPhraseMnemonic_component']"));
  words.getText().then(text => (
    expect(text).to.not.equal('')
  )).catch(err => assert.fail(err.message));
});

Then(/^I click Clear button$/, async function () {
  await this.click("//button[contains(text(), 'Clear')]", By.xpath);
});

Then(/^I see All selected words are cleared$/, async function () {
  await this.waitUntilText('.WalletRecoveryPhraseMnemonic_component', '', 5000);
});

Then(/^I should stay in the create wallet dialog$/, async function () {
  const createMessage = await i18n.formatMessage(this.driver, { id: 'wallet.add.dialog.create.description' });
  await this.waitUntilText('.Dialog_title', createMessage.toUpperCase(), 2000);
});

Then(/^I should see "Wallet name requires at least 1 and at most 40 letters." error message:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.SimpleFormField_error';
  await checkErrorByTranslationId(this, errorSelector, error);
});

Then(/^I should see "Invalid Password" error message:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.SimpleFormField_error';
  await checkErrorByTranslationId(this, errorSelector, error);
});

Then(/^I see the security warning prior:$/, async function (data) {
  const error = data.hashes()[0];
  const errorSelector = '.SimpleCheckbox_label';
  await checkErrorByTranslationId(this, errorSelector, error);
});
