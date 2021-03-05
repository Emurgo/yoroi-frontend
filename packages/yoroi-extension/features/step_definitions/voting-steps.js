// @flow

import { When, Then } from 'cucumber';
import { By, Key } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';

When(/^I go to the voting page$/, async function () {
  await this.click('.voting');
});

When(/^I click on the register button in the voting page$/, async function () {
  await this.click('.Voting_registerButton > .primary');
});

Then(/^I see the Auto generated Pin Steps$/, async function () {
  const elements = await this.driver.findElements(By.css('.GeneratePinDialog_pin > span '));

  const pin = [];
  for(const item of elements){
    pin.push(await item.getText());
  }
  this.pin = pin;
  await this.waitForElement('.GeneratePinDialog_dialog');
});

When(/^I click next on the generated pin step$/, async function () {
  await this.click('.GeneratePinDialog_dialog > .Dialog_actions > .primary');
});

Then(/^I see the confirm Pin step$/, async function () {
  await this.waitForElement('.ConfirmPinDialog_dialog');
});

Then(/^I enter the generated pin$/, async function () {
  const pin = this.pin.join('');
  await this.input("input[name='pin']", pin);
});

When(/^I click next on the confirm pin step$/, async function () {
  await this.click('.ConfirmPinDialog_dialog > .Dialog_actions > .primary');
});

Then(/^I see register step with spending password$/, async function () {
  await this.waitForElement('.RegisterDialog_dialog');
});

When(/^I click next on the register step$/, async function () {
  await this.click('.RegisterDialog_dialog > .Dialog_actions > .primary');
});

Then(/^I see confirm transaction step$/, async function () {
  await this.waitForElement('.VotingRegTxDialog_dialog');
});

Then(/^Then I see qr code step$/, async function () {
  await this.waitForElement('.QrCodeDialog_dialog');
});

Then(/^I enter the wrong pin$/, async function () {
  // use copy to avoid reversing original pin
  const pin = [...this.pin].reverse().join('');
  await this.input("input[name='pin']", pin);
});

Then(/^I see should see pin mismatch error$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'global.errors.pinDoesNotMatch' });

  // following selector is used as the error is deeply nested
  await this.waitUntilText(
    '.ConfirmPinDialog_dialog .ConfirmPinDialog_pinInputContainer .FormFieldOverridesClassic_error',
    errorMessage
  );

  // clear the wrong pin at the end
  // we doing backspace 4 times for pin length of 4
  // as .clear() does not update the react component value
  const input = this.driver.findElement(By.name('pin'));
  for(let i = 1; i<=4; i++) {
    input.sendKeys(Key.BACK_SPACE);
  }
});

Then(/^I see incorrect wallet password dialog$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'api.errors.IncorrectPasswordError' });

  await this.waitUntilText('.ErrorBlock_component > span', errorMessage);
});


Then(/^I see incorrect wallet password error in transaction step$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'api.errors.IncorrectPasswordError' });

  await this.waitUntilText('.VotingRegTxDialog_error', errorMessage);
});
