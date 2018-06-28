import { Given, When, Then } from 'cucumber';
import { expect } from 'chai';
import languageSelection from '../support/helpers/language-selection-helpers';

const LANGUAGE_SELECTION_FORM = '.LanguageSelectionForm_component';

Given(/^I have selected English language$/, async function () {
  await languageSelection.ensureLanguageIsSelected(this.driver, { language: 'en-US' });
});

When(/^I am on the language selection screen$/, function () {
  return this.waitForElement('.LanguageSelectionForm_component');
});

When(/^I open language selection dropdown$/, function () {
  return this.click('.LanguageSelectionForm_component .SimpleInput_input');
});

When(/^I select Japanese language$/, function () {
  return this.clickByXpath('//li[contains(text(), "Japanese")]');
});

When(/^I submit the language selection form$/, function () {
  return this.click('.LanguageSelectionForm_submitButton');
});

Then(/^I should not see the language selection screen anymore$/, function () {
  return this.waitForElementNotPresent(LANGUAGE_SELECTION_FORM);
});

Then(/^I should have Japanese language set$/, async function () {
  const result = await this.driver.executeAsyncScript((done) => {
    window.icarus.stores.profile.getProfileLocaleRequest.execute()
      .then(done)
      .catch((error) => done(error));
  });
  expect(result).to.equal('ja-JP');
});
