// @flow

import { When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';
import { truncateAddress, } from '../../app/utils/formatters';
import { amountInput } from '../pages/walletSendPage';

When(/^I click on "generate payment URL" button$/, async function () {
  await this.click({ locator: '.WalletReceive_generateURIIcon', method: 'css' });
  await this.waitForElement({ locator: '.URIGenerateDialog', method: 'css' });
});

Then(/^I generate a URI for ([0-9]+) ADA$/, async function (amount) {
  await this.input(amountInput, amount);
  await this.click({ locator: '.URIGenerateDialog_component .MuiButton-primary', method: 'css' });
});

Then(/^I should see the URI displayed in a new dialog$/, async function () {
  await this.waitForElement({ locator: '.URIDisplayDialog', method: 'css' });
});

Then(/^I click on the copy to clipboard icon$/, async function () {
  await this.click({ locator: '.URIDisplayDialog_uriDisplay .CopyableAddress_copyIconBig', method: 'css' });
});

When(/^I open a cardano URI for address (([^"]*)) and ([0-9]+) ADA$/, async function (address, amount) {
  // In practice, clicking a cardano URI will cause the browser to open a URL of this form
  const uri = this.getExtensionUrl() + '#/send-from-uri?q=web+cardano:' + address + '?amount=' + amount;
  await this.driver.get('about:blank'); // dummy step, but needed
  await this.driver.get(uri);
  await this.driver.sleep(500);
});

Then(/^I should see and accept a warning dialog$/, async function () {
  await this.waitForElement({ locator: '.URILandingDialog', method: 'css' });
  await this.click({ locator: '.URILandingDialog .MuiButton-primary', method: 'css' });
});

Then(/^I should see a dialog with the transaction details$/, async function (table) {
  const fields = table.hashes()[0];
  await this.waitForElement({ locator: '.URIVerifyDialog', method: 'css' });
  await this.waitUntilContainsText({ locator: '.URIVerifyDialog_address', method: 'css' }, truncateAddress(fields.address));
  await this.waitUntilContainsText({ locator: '.URIVerifyDialog_amount', method: 'css' }, fields.amount);
});

When(/^I confirm the URI transaction details$/, async function () {
  await this.click({ locator: '.URIVerifyDialog .primary', method: 'css' });
});

Then(/^I should land on send wallet screen with prefilled parameters$/, async function (table) {
  const fields = table.hashes()[0];
  const rxInput = await this.driver.findElement(By.xpath("//input[@name='receiver']")).getAttribute('value');
  expect(rxInput).to.be.equal(fields.address);
  const amountInput = await this.driver.findElement(By.xpath("//input[@name='amount']")).getAttribute('value');
  expect(amountInput).to.be.equal(fields.amount);
});

When(/^I open an invalid cardano URI$/, async function () {
  const invalidAddress = 'Ae2tdPwUPEZKmw0y3AU3cXb5Chnasj6mvVNxV1H11997q3VW5IhbSfQwGpm';
  const amount = '1';
  const uri = this.getExtensionUrl() + '#/send-from-uri?q=web+cardano:' + invalidAddress + '?amount=' + amount;
  await this.driver.get('about:blank'); // dummy step, but needed
  await this.driver.get(uri);
});

Then(/^I should see an "invalid URI" dialog$/, async function () {
  await this.waitForElement({ locator: '.URIInvalidDialog', method: 'css' });
});
