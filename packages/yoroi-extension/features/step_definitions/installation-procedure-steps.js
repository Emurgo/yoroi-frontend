// @flow

import { Given, When, Then } from 'cucumber';
import { expect } from 'chai';

const TERMS_OF_USE_FORM = '.TermsOfUseForm_component';

Given(/^I am on the "Terms of use" screen$/, async function () {
  await this.waitForElement(TERMS_OF_USE_FORM);
});

When(/^I click on "I agree with the terms of use" checkbox$/, async function () {
  await this.click('.TermsOfUseForm_component .SimpleCheckbox_root');
});

When(/^I submit the "Terms of use" form$/, async function () {
  await this.click('.TermsOfUseForm_submitButton');
});

Then(/^I should not see the "Terms of use" screen anymore$/, async function () {
  await this.waitForElementNotPresent(TERMS_OF_USE_FORM);
});

Then(/^I should have "Terms of use" accepted$/, async function () {
  const result = await this.driver.executeAsyncScript((done) => {
    window.yoroi.stores.profile.getTermsOfUseAcceptanceRequest.execute()
      .then(done)
      .catch((error) => done(error));
  });
  expect(result).to.equal(true);
});
