// @flow

import { When, Then } from 'cucumber';
import { By, error, Key } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';
import { expect } from 'chai';
import { checkErrorByTranslationId } from './common-steps';

When(/^I click the restore button for ([^"]*)$/, async function (currency) {
  await this.click('.WalletAdd_btnRestoreWallet');

  await this.waitForElement('.PickCurrencyOptionDialog');
  await this.click(`.PickCurrencyOptionDialog_${currency}`);

  await this.waitForElement('.WalletRestoreOptionDialog');
});

Then(/^I select Byron-era 15-word wallet$/, async function () {
  await this.click('.WalletRestoreOptionDialog_restoreNormalWallet');
  await this.click('.WalletEraOptionDialog_bgByronMainnet');
  await this.waitForElement('.WalletRestoreDialog');
});
Then(/^I select Shelley-era 15-word wallet$/, async function () {
  await this.click('.WalletRestoreOptionDialog_restoreNormalWallet');
  await this.click('.WalletEraOptionDialog_bgShelleyMainnet');
  await this.waitForElement('.WalletRestoreDialog');
});
Then(/^I select Shelley-era 24-word wallet$/, async function () {
  await this.click('.WalletRestoreOptionDialog_normal24WordWallet');
  await this.waitForElement('.WalletRestoreDialog');
});

Then(/^I select bip44 15-word wallet$/, async function () {
  await this.click('.WalletRestoreOptionDialog_restoreNormalWallet');
  await this.waitForElement('.WalletRestoreDialog');
});

When(/^I click the restore paper wallet button$/, async function () {
  await this.click('.WalletAdd_btnRestoreWallet');

  await this.waitForElement('.PickCurrencyOptionDialog');
  await this.click('.PickCurrencyOptionDialog_cardano');

  await this.waitForElement('.WalletRestoreOptionDialog');

  await this.click('.WalletRestoreOptionDialog_restorePaperWallet');
  await this.waitForElement('.WalletRestoreDialog');
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
  await this.input('input[name="masterKey"]', fields.masterKey);
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
  await this.waitUntilText('.dialog__title', restoreMessage.toUpperCase(), 2000);
});

Then(/^I delete recovery phrase by clicking "x" signs$/, async function () {
  const webElements = await this.driver.findElements(By.xpath(`//span[contains(text(), '×')]`));
  for (let i = 0; i < webElements.length; i++) {
    await this.click(`(//span[contains(text(), '×')])[1]`, By.xpath);
  }
  const expectedElements = await this.driver.findElements(
    By.xpath(`//span[contains(text(), '×')]`)
  );

  expect(expectedElements.length).to.be.equal(0);
});

Then(/^I should see an "Invalid recovery phrase" error message:$/, async function (data) {
  const expectedError = data.hashes()[0];
  const errorSelector = '//p[starts-with(@id, "recoveryPhrase--")]';
  await checkErrorByTranslationId(this, errorSelector, expectedError, By.xpath);
});

Then(/^I don't see last word of ([^"]*) in recovery phrase field$/, async function (table) {
  const words = table.split(' ');
  const lastWord = words[words.length - 1];
  await this.waitForElementNotPresent(
    `//span[contains(@class, 'SimpleAutocomplete') and contains(text(), "${lastWord}")]`,
    By.xpath
  );
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
  await this.waitUntilText(errorSelector, errorMessage, 15000, By.xpath);
});

Then(/^I should see the wallet already exist window$/, async function () {
  await this.waitForElement('.WalletAlreadyExistDialog_component');
});

When(/^I click the Open wallet button$/, async function () {
  await this.click('.confirmButton');
});
