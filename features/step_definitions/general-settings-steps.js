import { Given, When, Then } from 'cucumber';
import { expect } from 'chai';
import _ from 'lodash';
import {
  navigateTo,
  waitUntilUrlEquals,
} from '../support/helpers/route-helpers';

import { getActiveLanguage } from '../support/helpers/i18n-helpers';

Given(/^I am on the General Settings "([^"]*)" screen$/, async function (screen) {
  await navigateTo.call(this, `/settings/${screen}`);
});

When(/^I click on secondary menu (.*) item$/, async function (buttonName) {
  const buttonSelector = `.SettingsMenuItem_component.${_.camelCase(buttonName)}`;
  await this.driver.waitForElement(buttonSelector);
  await this.click(buttonSelector);
});

When(/^I open General Settings language selection dropdown$/, async function () {
  await this.click('.SettingsLayout_settingsPane .SimpleInput_input');
});

Then(/^I should see General Settings "([^"]*)" screen$/, async function (screenName) {
  await waitUntilUrlEquals.call(this, `/settings/${screenName}`);
});

Then(/^I should see Japanese language as selected$/, async function () {
  this.driver.wait(async () => {
    const activeLanguage = await getActiveLanguage(this.driver);
    return activeLanguage === 'ja-JP';
  });
});
