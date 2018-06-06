import { When, Then } from 'cucumber';

When(/^I click the restore button$/, async function () {
  await this.click('.restoreWalletButton');
});

When(/^I enter the name "([^"]*)"$/, async function (walletName) {
  await this.input('#walletName--1', walletName);
});

When(/^I enter the recovery phrase:$/, async function (table) {
  const fields = table.hashes()[0];
  const recoveryPhrase = fields.recoveryPhrase.split(' ');
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const word = recoveryPhrase[i];
    await this.input('.SimpleAutocomplete_autocompleteWrapper input', word);
    await this.clickByXpath(`//li[contains(text(), '${word}')]`);
  }
});

When(/^I enter the wallet password:$/, async function (table) {
  await this.click('.SimpleSwitch_switch'); // FIXME: This should be removed when password is made mandatory
  const fields = table.hashes()[0];
  await this.input('#walletPassword--3', fields.password);
  await this.input('#repeatPassword--4', fields.repeatedPassword);
});

When(/^I click the "Restore Wallet" button$/, async function () {
  await this.click('.WalletRestoreDialog .primary');
});

Then(/^I should see the restored wallet$/, async function () {
  await this.waitForElement('.TopBar_walletName');
});
