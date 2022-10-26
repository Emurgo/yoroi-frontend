// @flow

import type { LocatorObject } from '../support/webdriver';

export const registerButton: LocatorObject = {
  locator: '.Voting_registerButton > .MuiButton-primary',
  method: 'css',
};

export const generatePinDialog: LocatorObject = {
  locator: '.GeneratePinDialog_dialog',
  method: 'css',
};

export const confirmButton: LocatorObject = {
  locator: '//button[@id="primaryButton"]',
  method: 'xpath',
};

export const generatedPinStepElement: LocatorObject = {
  locator: '.GeneratePinDialog_pin > span',
  method: 'css',
};

export const confirmPinDialog: LocatorObject = {
  locator: '.ConfirmPinDialog_dialog',
  method: 'css',
};

export const pinInput: LocatorObject = { locator: "input[name='pin']", method: 'css' };

export const confirmPinDialogError: LocatorObject = {
  locator:
    '.ConfirmPinDialog_dialog .ConfirmPinDialog_pinInputContainer .FormFieldOverridesClassic_error',
  method: 'css',
};

export const registerDialog: LocatorObject = { locator: '.RegisterDialog_dialog', method: 'css' };

export const votingRegTxDialog: LocatorObject = {
  locator: '.VotingRegTxDialog_dialog',
  method: 'css',
};

export const votingRegTxDialogError: LocatorObject = {
  locator: '.VotingRegTxDialog_error',
  method: 'css',
};

export const qrCodeDialog: LocatorObject = { locator: '.QrCodeDialog_dialog', method: 'css' };

export const errorBlock: LocatorObject = { locator: '.ErrorBlock_component > span', method: 'css' };
