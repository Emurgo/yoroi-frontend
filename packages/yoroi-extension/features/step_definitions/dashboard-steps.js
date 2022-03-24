// @flow

import { Then, When, } from 'cucumber';

When(/^I go to the dashboard screen$/, async function () {
  await this.click({ locator: '.stakeDashboard ', method: 'css' });
});

When(/^I click on the withdraw button$/, async function () {
  await this.click({ locator: '.withdrawButton', method: 'css' });
});

Then(/^I should rewards in the history$/, async function () {
  await this.waitForElement({ locator: '.recharts-bar', method: 'css' });
});

When(/^I click on the unmangle warning$/, async function () {
  await this.click({ locator: '.UserSummary_mangledWarningIcon', method: 'css' });
  await this.click({ locator: '.UserSummary_link', method: 'css' });
});
