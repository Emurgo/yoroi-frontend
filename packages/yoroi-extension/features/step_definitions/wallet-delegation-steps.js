// @flow

import { Given, When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';

When(/^I go to the delegation by id screen$/, async function () {
  await this.click('.cardanoStake');
});

When(/^I fill the delegation id form:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input("input[name='poolId']", fields.stakePoolId);
});

Then(/^I see the stakepool ticker "([^"]*)"$/, async function (ticker) {
  await this.waitUntilText('.StakePool_userTitle', ticker);
});

When(/^I click on the next button in the delegation by id$/, async function () {
  await this.click('.DelegationSendForm_component .MuiButton-primary');
});

When(/^I see the delegation confirmation dialog$/, async function () {
  await this.waitForElement('.DelegationTxDialog_dialog');
});

Given(/^I click on see dashboard$/, async function () {
  await this.waitForElement('.SuccessPage_component');
  await this.click("//button[contains(text(), 'Dashboard page')]", By.xpath);
});

When(/^I should see the dashboard screen$/, async function () {
  await this.waitForElement('.StakingDashboard_page');
});

