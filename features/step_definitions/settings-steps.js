import {When, Then} from 'cucumber';

const walletNameInputSelector = '.WalletSettings_component .walletName input';

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

Then(/^I should see new wallet name "([^"]*)"$/, async function (walletName) {
  return this
    .driver
    .wait(async() => {
      const updatedName = await this.getText('.TopBar_walletName');
      return walletName.toUpperCase() === updatedName;
    });
});
