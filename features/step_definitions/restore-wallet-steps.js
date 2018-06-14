import { When } from 'cucumber';

When(/^I click the restore button$/, async function () {
  await this.click('.restoreWalletButton');
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

When(/^I enter the restored wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input('#walletPassword--3', fields.password);
  await this.input('#repeatPassword--4', fields.repeatedPassword);
});

When(/^I click the "Restore Wallet" button$/, async function () {
  await this.click('.WalletRestoreDialog .primary');
});
