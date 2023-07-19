// @flow

import { When, Then } from 'cucumber';
import { expect } from 'chai';
import { faqButton, walletButton } from '../pages/sidebarPage';
import { faqTabName } from '../support/windowManager';

When(/^I click on FAQ button$/, async function () {
  this.webDriverLogger.info(`Step: I click on FAQ button`);
  await this.click(faqButton);
});

Then(/^I should see the FAQ button$/, async function () {
  this.webDriverLogger.info(`Step: I should see FAQ button`);
  await this.waitForElement(faqButton);
});

Then(/^I should see a new tab opened with address (.+)$/, async function (address) {
  this.webDriverLogger.info(`Step: I should see a new tab opened with address ${address}`);
  await this.windowManager.findNewWindowAndSwitchTo(faqTabName);
  const actualAddresses = await this.driver.getCurrentUrl();
  expect(actualAddresses).to.equal(address);
});

When(/^I click on Wallet button$/, async function () {
  this.webDriverLogger.info(`Step: I click on Wallet button`);
  await this.click(walletButton);
  await this.waitForElement()
});
