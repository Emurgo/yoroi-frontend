// @flow

import { When, Then } from 'cucumber';
import { By, Key } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';

When(/^I go to the voting page$/, async function () {
  await this.click({ locator: '.voting', method: 'css' });
});

When(/^I click on the register button in the voting page$/, async function () {
  await this.click({ locator: '.Voting_registerButton > .primary', method: 'css' });
});

Then(/^I see the Auto generated Pin Steps$/, async function () {
  const elements = await this.driver.findElements(By.css('.GeneratePinDialog_pin > span '));

  const pin = [];
  for(const item of elements){
    pin.push(await item.getText());
  }
  this.pin = pin;
  await this.waitForElement({ locator: '.GeneratePinDialog_dialog', method: 'css' });
});

When(/^I click next on the generated pin step$/, async function () {
  await this.click({ locator: '.GeneratePinDialog_dialog > .Dialog_actions > .primary', method: 'css' });
});

Then(/^I see the confirm Pin step$/, async function () {
  await this.waitForElement({ locator: '.ConfirmPinDialog_dialog', method: 'css' });
});

Then(/^I enter the generated pin$/, async function () {
  const pin = this.pin.join('');
  await this.input({ locator: "input[name='pin']", method: 'css' }, pin);
});

When(/^I click next on the confirm pin step$/, async function () {
  await this.click({ locator: '.ConfirmPinDialog_dialog > .Dialog_actions > .primary', method: 'css' });
});

Then(/^I see register step with spending password$/, async function () {
  await this.waitForElement({ locator: '.RegisterDialog_dialog', method: 'css' });
});

When(/^I click next on the register step$/, async function () {
  await this.click({ locator: '.RegisterDialog_dialog > .Dialog_actions > .primary', method: 'css' });
});

Then(/^I see confirm transaction step$/, async function () {
  await this.waitForElement({ locator: '.VotingRegTxDialog_dialog', method: 'css' });
});

Then(/^Then I see qr code step$/, async function () {
  await this.waitForElement({ locator: '.QrCodeDialog_dialog', method: 'css' });
});

Then(/^I enter the wrong pin$/, async function () {
  // use copy to avoid reversing original pin
  const pin = [...this.pin].reverse().join('');
  await this.input({ locator: "input[name='pin']", method: 'css' }, pin);
});

Then(/^I see should see pin mismatch error$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'global.errors.pinDoesNotMatch' });

  // following selector is used as the error is deeply nested
  await this.waitUntilText(
    { locator: '.ConfirmPinDialog_dialog .ConfirmPinDialog_pinInputContainer .FormFieldOverridesClassic_error', method: 'css' },
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

  await this.waitUntilText({ locator: '.ErrorBlock_component > span', method: 'css' }, errorMessage);
});


Then(/^I see incorrect wallet password error in transaction step$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'api.errors.IncorrectPasswordError' });

  await this.waitUntilText({ locator: '.VotingRegTxDialog_error', method: 'css' }, errorMessage);
});
