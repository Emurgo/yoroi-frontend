// @flow

import { When, Then } from 'cucumber';
import { By, Key } from 'selenium-webdriver';
import { votingTab } from '../pages/walletPage';
import {
  confirmButton,
  confirmPinDialog,
  confirmPinDialogError,
  errorBlock,
  generatedPinStepElement,
  generatePinDialog,
  pinInput,
  qrCodeDialog,
  registerButton,
  registerDialog,
  votingRegTxDialog,
  votingRegTxDialogError,
} from '../pages/walletVotingPage';
import i18n from '../support/helpers/i18n-helpers';

When(/^I go to the voting page$/, async function () {
  await this.click(votingTab);
});

When(/^I click on the register button in the voting page$/, async function () {
  await this.click(registerButton);
});

Then(/^I see the Auto generated Pin Steps$/, async function () {
  const elements = await this.findElements(generatedPinStepElement);

  const pin = [];
  for (const item of elements) {
    pin.push(await item.getText());
  }
  this.pin = pin;
  await this.waitForElement(generatePinDialog);
});

When(/^I click next on the generated pin step$/, async function () {
  await this.click(confirmButton);
});

Then(/^I see the confirm Pin step$/, async function () {
  await this.waitForElement(confirmPinDialog);
});

Then(/^I enter the generated pin$/, async function () {
  const pin = this.pin.join('');
  await this.input(pinInput, pin);
});

When(/^I click next on the confirm pin step$/, async function () {
  await this.click(confirmButton);
});

Then(/^I see register step with spending password$/, async function () {
  await this.waitForElement(registerDialog);
});

When(/^I click next on the register step$/, async function () {
  await this.click(confirmButton);
});

Then(/^I see confirm transaction step$/, async function () {
  await this.waitForElement(votingRegTxDialog);
});

Then(/^Then I see qr code step$/, async function () {
  await this.waitForElement(qrCodeDialog);
});

Then(/^I enter the wrong pin$/, async function () {
  // use copy to avoid reversing original pin
  const pin = [...this.pin].reverse().join('');
  await this.input(pinInput, pin);
});

Then(/^I see should see pin mismatch error$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'global.errors.pinDoesNotMatch',
  });

  // following selector is used as the error is deeply nested
  await this.waitUntilText(confirmPinDialogError, errorMessage);

  // clear the wrong pin at the end
  // we are doing backspace 4 times for pin length of 4
  // as .clear() does not update the React component value
  const input = this.driver.findElement(By.name('pin'));
  for (let i = 1; i <= 4; i++) {
    input.sendKeys(Key.BACK_SPACE);
  }
});

Then(/^I see incorrect wallet password dialog$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.IncorrectPasswordError',
  });

  await this.waitUntilText(errorBlock, errorMessage);
});

Then(/^I see incorrect wallet password error in transaction step$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, {
    id: 'api.errors.IncorrectPasswordError',
  });

  await this.waitUntilText(votingRegTxDialogError, errorMessage);
});
