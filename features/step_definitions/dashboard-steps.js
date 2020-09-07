// @flow

import { When, } from 'cucumber';

When(/^I go to the dashboard screen$/, async function () {
  await this.click('.stakeDashboard ');
});

When(/^I click on the withdraw button$/, async function () {
  await this.click('.withdrawButton ');
});
