import { When } from 'cucumber';
import { By } from 'selenium-webdriver';

When(/^I click the create button$/, async function () {
  await this.click('.createWalletButton');
});

When(/^I enter the created wallet password:$/, async function (table) {
  await this.click('.SimpleSwitch_switch'); // FIXME: This should be removed when password is made mandatory
  const fields = table.hashes()[0];
  await this.input('.WalletCreateDialog .walletPassword input', fields.password);
  await this.input('.WalletCreateDialog .repeatedPassword input', fields.repeatedPassword);
});

When(/^I click the "Create personal wallet" button$/, async function () {
  await this.click('.WalletCreateDialog .primary');
});

When(/^I accept the creation terms$/, async function () {
  await this.click('.SimpleCheckbox_check');
  await this.click('.WalletBackupPrivacyWarningDialog .primary');
});

When(/^I copy and enter the displayed mnemonic phrase$/, async function () {
  // Get the displayed mnemonic
  const mnemonicElement = await this.getElementBy('.WalletRecoveryPhraseMnemonic_component');
  const mnemonic = await mnemonicElement.getText();
  await this.click('.WalletRecoveryPhraseDisplayDialog .primary');

  // Enter the saved mnemonic
  const recoveryPhrase = mnemonic.split(' ');
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const word = recoveryPhrase[i];
    await this.clickByXpath(`//button[contains(text(), '${word}')]`);
  }
  const checkboxes = await this.driver.findElements(By.css('.SimpleCheckbox_check'));
  checkboxes.forEach((box) => box.click());
  await this.click('.WalletRecoveryPhraseEntryDialog .primary');
});
