// @flow

import { By, WebElement } from 'selenium-webdriver';

export const signMessageTitle: LocatorObject = {
  locator: '//h5[contains(text(), "Sign Message")]',
  method: 'xpath',
};

export const dataText: LocatorObject = {
  locator: '//pre',
  method: 'xpath',
};

export const getSigningData = async (customWorld: Object): Promise<string> => {
  const dataTextElement = await customWorld.findElement(dataText);
  return await dataTextElement.getText();
};
