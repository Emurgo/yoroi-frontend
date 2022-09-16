// @flow

import type { LocatorObject } from '../support/webdriver';
import { By } from 'selenium-webdriver';

const LANGUAGE_SELECTION_FORM = '.LanguageSelectionForm_component';

// language select page
export const languageSelectionForm: LocatorObject = {
  locator: LANGUAGE_SELECTION_FORM,
  method: 'css',
};

export const languageSelectionFromDropdown: LocatorObject = {
  locator: `${LANGUAGE_SELECTION_FORM} .MuiInputBase-input`,
  method: 'css',
};

export const japaneseLaguageSelection: LocatorObject = {
  locator: '//span[contains(text(), "日本語")]',
  method: 'xpath',
};

export const continueButton: LocatorObject = {
  locator: '//button[text()="Continue"]',
  method: 'xpath',
};
// ToS page
export const termsOfUseComponent: LocatorObject = {
  locator: '.TermsOfUseForm_component',
  method: 'css',
};
export const getTosCheckbox = async (customWorld: Object): Promise<any> => {
  const tosClassElement = await customWorld.findElement(termsOfUseComponent);
  return await tosClassElement.findElement(By.xpath('//input[@type="checkbox"]'));
};

// uri prompt page
export const walletAddComponent: LocatorObject = { locator: '.WalletAdd_component', method: 'css' };
