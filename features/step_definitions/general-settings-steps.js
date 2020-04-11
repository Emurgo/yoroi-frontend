// @flow

import { Given, When, Then } from 'cucumber';
import { camelCase } from 'lodash';
import {
  waitUntilUrlEquals,
  navigateTo,
} from '../support/helpers/route-helpers';
import i18n from '../support/helpers/i18n-helpers';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';

When(/^I navigate to the general settings screen$/, async function () {
  await navigateTo.call(this, '/settings');
  await navigateTo.call(this, '/settings/general');

  await waitUntilUrlEquals.call(this, '/settings/general');
  await this.waitForElement('.SettingsLayout_component');
});

When(/^I click on secondary menu "([^"]*)" item$/, async function (buttonName) {
  const buttonSelector = `.SettingsMenuItem_component.${camelCase(buttonName)}`;
  await this.click(buttonSelector);
  await this.waitForElement(
    `${buttonSelector}.SettingsMenuItem_active`
  );
});

When(/^I select second theme$/, async function () {
  await this.click('.ThemeSettingsBlock_themesWrapper > button:nth-child(2)');
});

When(/^I open General Settings language selection dropdown$/, async function () {
  await this.click('.SettingsLayout_settingsPaneWrapper .SimpleInput_input');
});

Then(/^I should see secondary menu (.*) item disabled$/, async function (buttonName) {
  const formattedButtonName = camelCase(buttonName);
  const buttonSelector =
    `.SettingsMenuItem_component.SettingsMenuItem_disabled.${formattedButtonName}`;
  const label = await i18n.formatMessage(this.driver, { id: `settings.menu.${formattedButtonName}.link.label` });
  await this.waitUntilText(buttonSelector, label.toUpperCase());
});

Then(/^The Japanese language should be selected$/, async function () {
  await this.driver.wait(async () => {
    const activeLanguage = await i18n.getActiveLanguage(this.driver);
    return activeLanguage === 'ja-JP';
  });
});

Then(/^I should see second theme as selected$/, async function () {
  await this.waitForElement('.ThemeSettingsBlock_themesWrapper button:nth-child(2).ThemeSettingsBlock_active');
});

// ========== Paper wallet ==========

Then(/^I open Number of Adddresses selection dropdown$/, async function () {
  await this.click('.SettingsLayout_settingsPaneWrapper .SimpleInput_input');
});

Then(/^I select 2 addresses$/, async function () {
  return this.click('//span[contains(text(), "2")]', By.xpath);
});

Then(/^I click the create paper wallet button$/, async function () {
  await this.click('.createPaperWallet');
});

const fakeAddresses = [
  'Ae2tdPwUPEZBxVncTviWLPFDukXL7tDWfGXkLMw8CSjqZhPGB7SHkUFaASB',
  'Ae2tdPwUPEZKTSRpuAt5GhVda8ZAoPXHTXzX9xSP2Ms7YyakwAyREYBpR11',
];
Then(/^I enter the paper recovery phrase$/, async function () {
  /**
 * Mnemomic is printed on the paper wallet and not present in the UI
 * So we instead fetch the paper wallet from app memory
 */
  const recoveryPhrase = await this.driver.executeScript(() => (
    window.yoroi.stores.substores.ada.paperWallets.paper.scrambledWords
  ));
  for (let i = 0; i < recoveryPhrase.length; i++) {
    const word = recoveryPhrase[i];
    await this.input('.AutocompleteOverridesClassic_autocompleteWrapper input', word);
    await this.click(`//li[contains(text(), '${word}')]`, By.xpath);
  }
});

Given(/^I swap the paper wallet addresses$/, async function () {
  // make sure 2 addresses we generated as expected
  const addresses = await this.driver.executeScript(() => (
    window.yoroi.stores.substores.ada.paperWallets.paper.addresses
  ));
  expect(addresses.length).to.be.equal(2);

  // we swap out the generated addresses with fake ones to get a consistent UI for screenshots
  await this.driver.executeScript((fakes) => {
    window.yoroi.stores.substores.ada.paperWallets.paper.addresses = fakes;
  }, fakeAddresses);
});

Then(/^I should see two addresses displayed$/, async function () {
  const addressesElem = await this.driver.findElements(By.xpath("//span[contains(@class, 'RawHash_hash')]"));
  expect(addressesElem.length).to.be.equal(fakeAddresses.length);
  for (let i = 0; i < fakeAddresses.length; i++) {
    const address = await addressesElem[i].getText();
    expect(address).to.be.equal(fakeAddresses[i]);
  }
});
