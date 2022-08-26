// @flow

import type { LocatorObject } from '../support/webdriver';

// language select page
export const languageSelectionForm: LocatorObject = { locator: '.LanguageSelectionForm_component', method: 'css' };


export const continueButton: LocatorObject = { locator: '//button[text()="Continue"]', method: 'xpath' };
// ToS page
export const termsOfUseComponent: LocatorObject = { locator: '.TermsOfUseForm_component', method: 'css' };
// uri prompt page
export const walletAddComponent: LocatorObject ={ locator: '.WalletAdd_component', method: 'css' };