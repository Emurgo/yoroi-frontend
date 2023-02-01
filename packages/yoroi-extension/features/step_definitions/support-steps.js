// @flow

import { When, Then } from 'cucumber';
import { expect } from 'chai';
import {
  descriptionTextArea,
  emailInput,
  supportButton,
  getPlatformLocator,
  frameTitle,
  successText,
  submitButton,
  platformSelector,
  acceptCheckbox,
  iframe,
} from '../pages/supportPage';
import { halfMinute, mailsacEmail } from '../support/helpers/common-constants';
import {
  deleteAllEmails,
  deleteEmail,
  getEmailBody,
  getLastEmail, waitForNewEmail,
} from '../support/helpers/email-helper';

When(/^I click on Support button$/, async function () {
  this.webDriverLogger.info(`Step: I click on Support button`);
  await this.click(supportButton);
});

Then(/^I should see the Support button$/, async function () {
  this.webDriverLogger.info(`Step: I should see Support button`);
  await this.waitForElement(supportButton);
});

When(/^I send a new Support request with text "(.+)"$/, async function (text) {
  this.webDriverLogger.info(
    `Step: I send a new Support request with email address ${mailsacEmail} and text ${text}`
  );
  this.webDriverLogger.info(`Step: Deleting all emails before sending`);
  await deleteAllEmails();

  // Switch to iframe
  const supportIFrame = await this.findElement(iframe);
  await this.driver.switchTo().frame(supportIFrame);

  // enter email address
  await this.waitForElement(emailInput);
  await this.input(emailInput, mailsacEmail);

  // enter description text
  await this.input(descriptionTextArea, text);

  // select platform depending on test browser
  await this.click(platformSelector);
  const browser = this.getBrowser();
  const capBrowser = browser.charAt(0).toUpperCase() + browser.slice(1);
  const platformLocator = getPlatformLocator(capBrowser);
  await this.click(platformLocator);

  // check checkbox
  await this.waitForElement(acceptCheckbox);
  await this.click(acceptCheckbox);

  // submit
  await this.click(submitButton);
  // Switch back to main window
  await this.driver.switchTo().defaultContent();
});

Then(/^I see the message was sent to support$/, async function () {
  this.webDriverLogger.info(`Step: I see the message was sent to support`);
  // Switch to iframe
  const supportIFrame = await this.findElement(iframe);
  await this.driver.switchTo().frame(supportIFrame);

  await this.driver.sleep(2000);
  await this.waitForElementNotPresent(submitButton);
  await this.waitForElement(frameTitle);
  const frameTitleText = await this.getText(frameTitle);
  expect(frameTitleText).to.be.equal('Message sent');

  const successElemText = await this.getText(successText);
  // Switch back to main window
  await this.driver.switchTo().defaultContent();
  expect(successElemText).to.be.equal('Thanks for reaching out');
});

Then(/^I check the email inbox for validation$/, async function () {
  this.webDriverLogger.info(`Step: I check the email inbox for validation`);
  await waitForNewEmail(halfMinute);

  const lastEmail = await getLastEmail();
  this.webDriverLogger.info(`Step: -> I get the last email received`);

  expect(lastEmail.from[0].address).to.be.equal('support@emurgohelpdesk.zendesk.com');
  expect(lastEmail.subject).to.be.equal('[Request received]');

  const emailId = lastEmail._id;

  const lastEmailBody = await getEmailBody(emailId);
  this.webDriverLogger.info(`Step: -> Get last email body:\n${lastEmailBody}`);

  const bodyList = lastEmailBody.split('\n');
  expect(bodyList[0]).to.match(
    /Your request (.+) has been received and is being reviewed by our support staff./
  );
  expect(bodyList[2]).to.equal('To add additional comments, reply to this email.');
  expect(bodyList[5]).to.equal('This email is a service from EMURGO.');

  this.webDriverLogger.info(`Step: -> Delete email`);
  const resDel = await deleteEmail(emailId);
  this.webDriverLogger.info(`Step: -> Delete email response:\n${JSON.stringify(resDel)}`);
});
