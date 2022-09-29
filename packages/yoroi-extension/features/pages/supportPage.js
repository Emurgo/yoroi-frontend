// @flow

import type { LocatorObject } from '../support/webdriver';

export const iframe: LocatorObject = { locator: '#webWidget', method: 'css' };

export const supportButton: LocatorObject = {
  locator: '.MuiButtonBase-root',
  method: 'css',
};

export const emailInput: LocatorObject = {
  locator: '//input[@name="email"]',
  method: 'xpath',
};

export const descriptionTextArea: LocatorObject = {
  locator: '//textarea[@name="description"]',
  method: 'xpath',
};

export const submitButton: LocatorObject = {
  locator: '//button[@type="submit"]',
  method: 'xpath',
};

export const platformSelector: LocatorObject = {
  locator: '//main/div[1]/div[2]/div/div[1]/div/div',
  method: 'xpath',
};

export const acceptCheckbox: LocatorObject = {
  locator: '//main/div[1]/div[5]/div/div/label',
  method: 'xpath',
};

export const getPlatformLocator = (platform: string): LocatorObject => {
  return {
    locator: `//li[contains(text(), "${platform}")]`,
    method: 'xpath',
  };
};

export const successText: LocatorObject = {
  locator: 'h2',
  method: 'css',
};

export const frameTitle: LocatorObject = {
  locator: 'h1',
  method: 'css',
};
