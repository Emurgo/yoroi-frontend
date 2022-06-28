// @flow

import { Given, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';
import { truncateAddress, } from '../../app/utils/formatters';
import { enterRecoveryPhrase } from '../support/helpers/helpers';

// ========== Paper wallet ==========

Then(/^I open Number of Adddresses selection dropdown$/, async function () {
  await this.click({ locator: '.WalletPaperDialog_component .MuiSelect-select', method: 'css' });
});

Then(/^I select 2 addresses$/, async function () {
  return this.click({ locator: '//li[contains(text(), "2")]', method: 'xpath' });
});

Then(/^I click the create paper wallet button$/, async function () {
  await this.click({ locator: '.primary', method: 'css' });
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

  await enterRecoveryPhrase(this, recoveryPhrase.join(' '));
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
    expect(address).to.be.equal(truncateAddress(fakeAddresses[i]));
  }
});
