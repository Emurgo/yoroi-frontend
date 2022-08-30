// @flow

import { Given, When, Then } from 'cucumber';
import {
  delegationDashboardPage,
  delegationDashboardPageButton,
  delegationFormNextButton,
  delegationSuccessPage,
  delegationTxDialog,
  poolIdInput,
  stakePoolTicker,
} from '../pages/walletDelegationPage';
import { delegationByIdTab } from '../pages/walletPage';

When(/^I go to the delegation by id screen$/, async function () {
  await this.click(delegationByIdTab);
});

When(/^I fill the delegation id form:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input(poolIdInput, fields.stakePoolId);
});

Then(/^I see the stakepool ticker "([^"]*)"$/, async function (ticker) {
  await this.waitUntilText(stakePoolTicker, ticker);
});

When(/^I click on the next button in the delegation by id$/, async function () {
  await this.click(delegationFormNextButton);
});

When(/^I see the delegation confirmation dialog$/, async function () {
  await this.waitForElement(delegationTxDialog);
});

Given(/^I click on see dashboard$/, async function () {
  await this.waitForElement(delegationSuccessPage);
  await this.click(delegationDashboardPageButton);
});

When(/^I should see the dashboard screen$/, async function () {
  await this.waitForElement(delegationDashboardPage);
});
