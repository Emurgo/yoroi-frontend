// @flow

import type { LocatorObject } from '../support/webdriver';

export const signMessageTitle: LocatorObject = {
  locator: 'signMessageTitle',
  method: 'id',
};

export const dataText: LocatorObject = {
  locator: 'signMessageBox-payload',
  method: 'id',
};

export const getSigningData = async (customWorld: Object): Promise<string> => {
  const dataTextElement = await customWorld.findElement(dataText);
  return await dataTextElement.getText();
};
