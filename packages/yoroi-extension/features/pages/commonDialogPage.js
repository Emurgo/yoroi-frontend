// @flow

import type { LocatorObject } from '../support/webdriver';
import { By } from 'selenium-webdriver';

export const primaryButton: LocatorObject = { locator: '.primary', method: 'css' };
export const errorBlockComponent: LocatorObject = {
  locator: '.ErrorBlock_component',
  method: 'css',
};
export const dialogTitle: LocatorObject = { locator: '.dialog__title', method: 'css' };

export const warningCheckboxElement: LocatorObject = {
  locator: '.DangerousActionDialog_checkbox',
  method: 'css',
};

export const getWarningCheckbox = async (customWorld: Object) => {
  const warningCheckboxComponent = await customWorld.findElement(warningCheckboxElement);
  return await warningCheckboxComponent.findElement(By.xpath('//input[@type="checkbox"]'));
}
