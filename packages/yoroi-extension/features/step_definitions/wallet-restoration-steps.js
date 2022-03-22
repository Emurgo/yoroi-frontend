// @flow

import { When, Then } from 'cucumber';
import { By, error, Key } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';
import { expect } from 'chai';
import { checkErrorByTranslationId } from './common-steps';

When(/^I click the restore button for ([^"]*)$/, async function (currency) {
  await this.click({ locator: '.WalletAdd_btnRestoreWallet', method: 'css' });

  await this.waitForElement({ locator: '.PickCurrencyOptionDialog', method: 'css' });
  await this.click({ locator: `.PickCurrencyOptionDialog_${currency}`, method: 'css' });

  await this.waitForElement({ locator: '.WalletRestoreOptionDialog', method: 'css' });
});

Then(/^I select Byron-era 15-word wallet$/, async function () {
  await this.click({ locator: '.WalletRestoreOptionDialog_restoreNormalWallet', method: 'css' });
  await this.click({ locator: '.WalletEraOptionDialog_bgByronMainnet', method: 'css' });
  await this.waitForElement({ locator: '.WalletRestoreDialog', method: 'css' });
});
Then(/^I select Shelley-era 15-word wallet$/, async function () {
  await this.click({ locator: '.WalletRestoreOptionDialog_restoreNormalWallet', method: 'css' });
  await this.click({ locator: '.WalletEraOptionDialog_bgShelleyMainnet', method: 'css' });
  await this.waitForElement({ locator: '.WalletRestoreDialog', method: 'css' });
});
Then(/^I select Shelley-era 24-word wallet$/, async function () {
  await this.click({ locator: '.WalletRestoreOptionDialog_normal24WordWallet', method: 'css' });
  await this.waitForElement({ locator: '.WalletRestoreDialog', method: 'css' });
});

Then(/^I select bip44 15-word wallet$/, async function () {
  await this.click({ locator: '.WalletRestoreOptionDialog_restoreNormalWallet', method: 'css' });
  await this.waitForElement({ locator: '.WalletRestoreDialog', method: 'css' });
});

When(/^I click the restore paper wallet button$/, async function () {
  await this.click({ locator: '.WalletAdd_btnRestoreWallet', method: 'css' });

  await this.waitForElement({ locator: '.PickCurrencyOptionDialog', method: 'css' });
  await this.click({ locator: '.PickCurrencyOptionDialog_cardano', method: 'css' });

  await this.waitForElement({ locator: '.WalletRestoreOptionDialog', method: 'css' });

  await this.click({ locator: '.WalletRestoreOptionDialog_restorePaperWallet', method: 'css' });
  await this.waitForElement({ locator: '.WalletRestoreDialog', method: 'css' });
});

When(/^I enter the recovery phrase:$/, async function (table) {
  const fields = table.hashes()[0];
  await enterRecoveryPhrase(this, fields.recoveryPhrase);
});

When(/^I can't enter more then 15 words from the recovery phrase:$/, async function (table) {
  const fields = table.hashes()[0];
  let result = false;
  try {
    await enterRecoveryPhrase(this, fields.recoveryPhrase);
  } catch (e) {
    if (e instanceof error.ElementNotInteractableError) {
      result = true;
    } else {
      throw e;
    }
  }

  expect(result).to.be.true;
});

export async function enterRecoveryPhrase(customWorld: any, phrase: string): Promise<void> {
  const recoveryPhrase = phrase.split(' ');
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const word = recoveryPhrase[i];
    await customWorld.driver
      .findElement(By.xpath('//input[starts-with(@id, "downshift-") and contains(@id, "-input")]'))
      .sendKeys(word, Key.RETURN);
    if (i === 0) await customWorld.driver.sleep(500);
  }
}

When(/^I enter the master key:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input({ locator: 'input[name="masterKey"]', method: 'css' }, fields.masterKey);
});

When(/^I enter one more word to the recovery phrase field:$/, async function (table) {
  const words = table.hashes()[0];
  const inputElement = await this.driver.findElement(
    By.xpath('//input[starts-with(@id, "downshift-") and contains(@id, "-input")]')
  );
  try {
    await inputElement.sendKeys(words.word, Key.RETURN);
    expect(false, 'Recovery phrase is intractable').to.true;
  } catch (e) {
    expect(e instanceof error.ElementNotInteractableError).to.be.true;
  }
  const lastWord = await this.driver.findElements(
    By.xpath(`//span[contains(text(), '${words.word}')]`)
  );
  expect(lastWord.length).to.be.equal(0);
});

When(/^I clear the recovery phrase$/, async function () {
  await this.clearInputUpdatingForm({ locator: '.AutocompleteOverridesClassic_autocompleteWrapper input', method: 'css' }, 15);
});

When(/^I enter the restored wallet password:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input({ locator: "input[name='walletPassword']", method: 'css' }, fields.password);
  await this.input({ locator: "input[name='repeatPassword']", method: 'css' }, fields.repeatedPassword);
});

Then(/^I repeat the wallet password "([^"]*)"$/, async function (password) {
  await this.input({ locator: "input[name='repeatPassword']", method: 'css' }, password);
});

When(/^I enter the paper wallet password "([^"]*)"$/, async function (password) {
  await this.input({ locator: "input[name='paperPassword']", method: 'css' }, password);
});

When(/^I clear the restored wallet password ([^"]*)$/, async function (password) {
  await this.clearInputUpdatingForm({ locator: "input[name='walletPassword']", method: 'css' }, password.length);
});

When(/^I click the "Restore Wallet" button$/, async function () {
  await this.click({ locator: '.WalletRestoreDialog .primary', method: 'css' });
});

Then(/^I should see an "Invalid recovery phrase" error message$/, async function () {
  await this.driver.sleep(500);
  const errorElement = this.driver.findElement(
    By.xpath('//p[contains(@class, "-error") and contains(@id, "recoveryPhrase")]')
  );
  expect(await errorElement.isDisplayed()).to.be.true;
});

Then(/^I should see a plate ([^"]*)$/, async function (plate) {
  const plateElements = await getPlates(this);
  const plateText = await plateElements[0].getText();
  expect(plateText).to.be.equal(plate);
});

Then(/^I should see a plates$/, async function (table) {
  const rows = table.hashes();

  const plateElements = await getPlates(this);
  for (let i = 0; i < rows.length; i++) {
    const plateText = await plateElements[i].getText();
    expect(plateText).to.be.equal(rows[i].plate);
  }
});

export async function getPlates(customWorld: any): Promise<any> {
  // check plate in confirmation dialog
  let plateElements = await customWorld.driver.findElements(
    By.css('.WalletRestoreVerifyDialog_plateIdSpan')
  );

  // this makes this function also work for wallets that already exist
  if (plateElements.length === 0) {
    plateElements = await customWorld.driver.findElements(By.css('.NavPlate_plate'));
  }
  return plateElements;
}

Then(/^I should stay in the restore wallet dialog$/, async function () {
  const restoreMessage = await i18n.formatMessage(this.driver, {
    id: 'wallet.restore.dialog.title.label',
  });
  await this.waitUntilText({ locator: '.dialog__title', method: 'css' }, restoreMessage.toUpperCase(), 2000);
});

Then(/^I delete recovery phrase by clicking "x" signs$/, async function () {
  const webElements = await this.driver.findElements(By.xpath(`//span[contains(text(), '×')]`));
  for (let i = 0; i < webElements.length; i++) {
    await this.click({ locator: `(//span[contains(text(), '×')])[1]`, method: 'xpath' });
  }
  const expectedElements = await this.driver.findElements(
    By.xpath(`//span[contains(text(), '×')]`)
  );

  expect(expectedElements.length).to.be.equal(0);
});

Then(/^I should see an "Invalid recovery phrase" error message:$/, async function (data) {
  const expectedError = data.hashes()[0];
  await checkErrorByTranslationId(
    this,
    { locator: '//p[starts-with(@id, "recoveryPhrase--")]', method: 'xpath' },
    expectedError);
});

Then(/^I don't see last word of ([^"]*) in recovery phrase field$/, async function (table) {
  const words = table.split(' ');
  const lastWord = words[words.length - 1];
  await this.waitForElementNotPresent({
    locator: `//span[contains(@class, 'SimpleAutocomplete') and contains(text(), "${lastWord}")]`,
    method: 'xpath'
  });
});

// eslint-disable-next-line no-unused-vars
Then(/^I should see an "(\d{1,2}) words left" error message:$/, async function (number, data) {
  const expectedError = data.hashes()[0];
  await this.driver.sleep(1000);
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: expectedError.message,
    values: { number: Number(number) },
  });
  const errorSelector = '//p[starts-with(@id, "recoveryPhrase--")]';
  await this.waitUntilText(
    { locator: errorSelector, method: 'xpath' },
    errorMessage,
    15000);
});

Then(/^I should see the wallet already exist window$/, async function () {
  await this.waitForElement({ locator: '.WalletAlreadyExistDialog_component', method: 'css' });
});

When(/^I click the Open wallet button$/, async function () {
  await this.click({ locator: '.confirmButton', method: 'css' });
});
