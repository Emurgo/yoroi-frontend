// @flow

import { Given, When, Then } from 'cucumber';

When(/^I go to the delegation by id screen$/, async function () {
  await this.click({ locator: '.cardanoStake', method: 'css' });
});

When(/^I fill the delegation id form:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input({ locator: "input[name='poolId']", method: 'css' }, fields.stakePoolId);
});

Then(/^I see the stakepool ticker "([^"]*)"$/, async function (ticker) {
  await this.waitUntilText({ locator: '.StakePool_userTitle', method: 'css' }, ticker);
});

When(/^I click on the next button in the delegation by id$/, async function () {
  await this.click({ locator: '.DelegationSendForm_component .MuiButton-primary', method: 'css' });
});

When(/^I see the delegation confirmation dialog$/, async function () {
  await this.waitForElement({ locator: '.DelegationTxDialog_dialog', method: 'css' });
});

Given(/^I click on see dashboard$/, async function () {
  await this.waitForElement({ locator: '.SuccessPage_component', method: 'css' });
  await this.click({ locator: "//button[contains(text(), 'Dashboard page')]", method: 'xpath' });
});

