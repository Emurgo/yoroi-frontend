// @flow

import { Given, When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';
import { termsOfUseComponent } from '../pages/basicSetupPage';

const TERMS_OF_USE_FORM = '.TermsOfUseForm_component';

Given(/^I am on the "Terms of use" screen$/, async function () {
  await this.waitForElement(termsOfUseComponent);
});

When(/^I click on "I agree with the terms of use" checkbox$/, async function () {
  const tosClassElement = await this.driver.findElement(By.css(TERMS_OF_USE_FORM));
  const checkbox = await tosClassElement.findElement(By.xpath('//input[@type="checkbox"]'));
  await checkbox.click();
});

When(/^I submit the "Terms of use" form$/, async function () {
  const TOSComponent = await this.driver.findElement(By.css('.TermsOfUseForm_checkbox'));
  const continueButton = await TOSComponent.findElement(By.xpath('//button'));
  await continueButton.click();
});

Then(/^I should not see the "Terms of use" screen anymore$/, async function () {
  await this.waitForElementNotPresent(termsOfUseComponent);
});

Then(/^I should have "Terms of use" accepted$/, async function () {
  const result = await this.driver.executeAsyncScript((done) => {
    window.yoroi.stores.profile.getTermsOfUseAcceptanceRequest.execute()
      .then(done)
      .catch((error) => done(error));
  });
  expect(result).to.equal(true);
});
