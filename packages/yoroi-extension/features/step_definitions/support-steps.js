// @flow

import { When, Given, Then } from 'cucumber';
import { expect } from 'chai';
import { faqButton } from '../pages/sidebarPage';
import { faqTabName } from '../support/windowManager';

When(/^I click on Support button$/, async function () {
  this.webDriverLogger.info(`Step: I click on Support button`);
  await this.click({locator: '.MuiButtonBase-root', method: 'css'});
});

Then(/^I should see the Support button$/, async function () {
  this.webDriverLogger.info(`Step: I should see Support button`);
  await this.waitForElement({locator: '.MuiButtonBase-root', method: 'css'});
});

When(/^I send a new Support request with email address (.+) and text "(.+)"$/, async function (email, text) {
  this.webDriverLogger.info(`Step: I send a new Support request with email address ${email} and text ${text}`);
  /*await this.windowManager.findNewWindowAndSwitchTo(faqTabName);
  const actualAddresses = await this.driver.getCurrentUrl();
  expect(actualAddresses).to.equal(address);*/

  this.click({locator:'submit', method: 'css'});
});