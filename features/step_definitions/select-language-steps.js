// @flow

import { Given, When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';
import languageSelection from '../support/helpers/language-selection-helpers';

const LANGUAGE_SELECTION_FORM = '.LanguageSelectionForm_component';

Given(/^I have selected English language$/, async function () {
  await languageSelection.ensureLanguageIsSelected(this, { language: 'en-US' });
});

When(/^I am on the language selection screen$/, async function () {
  await this.waitForElement(LANGUAGE_SELECTION_FORM);
});

When(/^I open language selection dropdown$/, async function () {
  await this.click(`${LANGUAGE_SELECTION_FORM} .SimpleInput_input`);
});

When(/^I select Japanese language$/, async function () {
  return this.click('//span[contains(text(), "日本語")]', By.xpath);
});

When(/^I submit the language selection form$/, async function () {
  await this.click('.LanguageSelectionForm_submitButton');
});

Then(/^I should not see the language selection screen anymore$/, async function () {
  await this.waitForElementNotPresent(LANGUAGE_SELECTION_FORM);
});

Then(/^I should have Japanese language set$/, async function () {
  const result = await this.driver.executeAsyncScript((done) => {
    window.yoroi.stores.profile.getProfileLocaleRequest.execute()
      .then(done)
      .catch((error) => done(error));
  });
  expect(result).to.equal('ja-JP');
});
