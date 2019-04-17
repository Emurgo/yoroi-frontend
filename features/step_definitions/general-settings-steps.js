// @flow

import { When, Then } from 'cucumber';
import _ from 'lodash';
import {
  waitUntilUrlEquals,
} from '../support/helpers/route-helpers';
import i18n from '../support/helpers/i18n-helpers';

When(/^I navigate to the general settings screen$/, async function () {
  await this.click('.TopBarCategory_componentClassic.settings');
  await waitUntilUrlEquals.call(this, '/settings/general');
  await this.waitForElement('.SettingsLayout_componentClassic');
});

When(/^I click on secondary menu "([^"]*)" item$/, async function (buttonName) {
  const buttonSelector = `.SettingsMenuItem_componentClassic.${_.camelCase(buttonName)}`;
  await this.click(buttonSelector);
  await this.waitForElement(
    `${buttonSelector}.SettingsMenuItem_active`
  );
});

When(/^I select second theme$/, async function () {
  await this.click('.DisplaySettings_themesWrapper > button:nth-child(2)');
});

When(/^I open General Settings language selection dropdown$/, async function () {
  await this.click('.SettingsLayout_settingsPaneClassic .SimpleInput_input');
});

Then(/^I should see secondary menu (.*) item disabled$/, async function (buttonName) {
  const formattedButtonName = _.camelCase(buttonName);
  const buttonSelector =
    `.SettingsMenuItem_componentClassic.SettingsMenuItem_disabled.${formattedButtonName}`;
  const label = await i18n.formatMessage(this.driver, { id: `settings.menu.${formattedButtonName}.link.label` });
  await this.waitUntilText(buttonSelector, label);
});

Then(/^The Japanese language should be selected$/, async function () {
  this.driver.wait(async () => {
    const activeLanguage = await i18n.getActiveLanguage(this.driver);
    return activeLanguage === 'ja-JP';
  });
});

Then(/^I should see second theme as selected$/, async function () {
  await this.waitForElement('.DisplaySettings_themesWrapper button:nth-child(4).DisplaySettings_active');
});
