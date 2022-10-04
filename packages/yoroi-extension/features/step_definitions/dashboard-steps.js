// @flow

import { Then, When, } from 'cucumber';
import { mangledWarningIcon, rechartBar, userSummaryLink, withdrawButton } from '../pages/walletDashboardPage';
import { dashboardTab } from '../pages/walletPage';

When(/^I go to the dashboard screen$/, async function () {
  await this.click(dashboardTab);
});

When(/^I click on the withdraw button$/, async function () {
  await this.click(withdrawButton);
});

Then(/^I should rewards in the history$/, async function () {
  await this.waitForElement(rechartBar);
});

When(/^I click on the unmangle warning$/, async function () {
  await this.click(mangledWarningIcon);
  await this.click(userSummaryLink);
});
