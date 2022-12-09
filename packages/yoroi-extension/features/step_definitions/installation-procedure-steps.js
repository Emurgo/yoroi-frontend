// @flow

import { Given, When, Then } from 'cucumber';
import { expect } from 'chai';
import { continueButton, getTosCheckbox, termsOfUseComponent } from '../pages/basicSetupPage';

Given(/^I am on the "Terms of use" screen$/, async function () {
  await this.waitForElement(termsOfUseComponent);
});

When(/^I click on "I agree with the terms of use" checkbox$/, async function () {
  this.webDriverLogger.info(`Step: I click on "I agree with the terms of use" checkbox`);
  await this.waitForElement(termsOfUseComponent);
  const checkbox = await getTosCheckbox(this);
  await checkbox.click();
});

When(/^I submit the "Terms of use" form$/, async function () {
  await this.click(continueButton);
});

Then(/^I should not see the "Terms of use" screen anymore$/, async function () {
  await this.waitForElementNotPresent(termsOfUseComponent);
});

Then(/^I should have "Terms of use" accepted$/, async function () {
  const result = await this.driver.executeAsyncScript(done => {
    window.yoroi.stores.profile.getTermsOfUseAcceptanceRequest
      .execute()
      .then(done)
      .catch(error => done(error));
  });
  expect(result).to.equal(true);
});
