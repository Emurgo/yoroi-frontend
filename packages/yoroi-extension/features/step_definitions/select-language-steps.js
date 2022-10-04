// @flow

import { Given, When, Then } from 'cucumber';
import { expect } from 'chai';
import languageSelection, { clickContinue } from '../support/helpers/language-selection-helpers';
import {
  japaneseLaguageSelection,
  languageSelectionForm,
  languageSelectionFromDropdown,
} from '../pages/basicSetupPage';

Given(/^I have selected English language$/, async function () {
  await languageSelection.ensureLanguageIsSelected(this, { language: 'en-US' });
});

When(/^I am on the language selection screen$/, async function () {
  await this.waitForElement(languageSelectionForm);
});

When(/^I open language selection dropdown$/, async function () {
  await this.click(languageSelectionFromDropdown);
});

When(/^I select Japanese language$/, async function () {
  return this.click(japaneseLaguageSelection);
});

When(/^I submit the language selection form$/, async function () {
  await clickContinue(this);
});

Then(/^I should not see the language selection screen anymore$/, async function () {
  await this.waitForElementNotPresent(languageSelectionForm);
});

Then(/^I should have Japanese language set$/, async function () {
  const result = await this.driver.executeAsyncScript(done => {
    window.yoroi.stores.profile.getProfileLocaleRequest
      .execute()
      .then(done)
      .catch(error => done(error));
  });
  expect(result).to.equal('ja-JP');
});
