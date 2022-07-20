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
} from '../pages/supportPage';
import { By } from 'selenium-webdriver';

import { mailsacEmail, emailOptions, mailsacAPIKey } from '../support/helpers/common-constants';

const axios = require('axios');

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

  // Switch to iframe
  await this.driver.switchTo().frame(this.driver.findElement(By.id('webWidget')));

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
});

Then(/^I see the message was sent to support$/, async function () {
  this.webDriverLogger.info(`Step: I see the message was sent to support`);
  await this.driver.sleep(2000);
  await this.waitForElement(frameTitle);
  const frameTitleText = await this.getText(frameTitle);
  expect(frameTitleText).to.be.equal('Message sent');

  const successElemText = await this.getText(successText);
  expect(successElemText).to.be.equal('Thanks for reaching out');
});

Then(/^I check the email inbox for validation$/, async function () {
  this.webDriverLogger.info(`Step: I check the email inbox for validation`);
  // wait for email to arrive
  await this.driver.sleep(1000);

  this.webDriverLogger.info(`Step: I get the last email received`);

  this.webDriverLogger.info(`Get emails list`);
  const resEmails = await axios(emailOptions);
  this.webDriverLogger.info(`Data: ${JSON.stringify(resEmails.data)}`);

  const lastEmail = resEmails.data[0];
  expect(lastEmail.from[0].address).to.be.equal('support@emurgohelpdesk.zendesk.com');
  expect(lastEmail.subject).to.be.equal('[Request received]');

  const emailId = lastEmail._id;

  const resFirst = await axios({
    method: 'get',
    url: `https://mailsac.com/api/text/${mailsacEmail}/${emailId}`,
    headers: { 'Mailsac-Key': mailsacAPIKey },
  });
  this.webDriverLogger.info(`Data: Get last email body: ${resFirst.data}`);

  const bodyList = resFirst.data.split('\n');
  expect(bodyList[0]).to.match(
    /Your request (.+) has been received and is being reviewed by our support staff./
  );
  expect(bodyList[2]).to.equal('To add additional comments, reply to this email.');
  expect(bodyList[5]).to.equal('This email is a service from EMURGO.');

  this.webDriverLogger.info(`Delete email`);
  const resDel = await axios.delete(
    `https://mailsac.com/api/addresses/${mailsacEmail}/messages/${emailId}`,
    {
      headers: { 'Mailsac-Key': mailsacAPIKey },
    }
  );
  this.webDriverLogger.info(`Data: ${JSON.stringify(resDel.data)}`);
});
