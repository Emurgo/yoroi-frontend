// @flow

import type { LocatorObject } from '../support/webdriver';

export const settingsLayoutComponent: LocatorObject = { locator: '.SettingsLayout_component', method: 'css' };
export const secondThemeSelected: LocatorObject = {
    locator: '.ThemeSettingsBlock_themesWrapper button:nth-child(2).ThemeSettingsBlock_active',
    method: 'css'
  };

  export const complexityLevelForm: LocatorObject = { locator: '.ComplexityLevelForm_cardsWrapper', method: 'css' };
  export const complexitySelected: LocatorObject = { locator: '.currentLevel', method: 'css' };
  export const languageSelector: LocatorObject = { locator: '//div[starts-with(@id, "languageId")]', method: 'xpath' };


