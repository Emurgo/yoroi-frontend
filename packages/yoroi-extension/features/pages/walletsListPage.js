// @flow

import type { LocatorObject } from '../support/webdriver';

import { WebElement } from 'selenium-webdriver';
import { getMethod } from '../support/helpers/helpers';
import { NoSuchElementError } from 'selenium-webdriver/lib/error';

const walletRow: LocatorObject = { locator: '.WalletRow_content', method: 'css' };
const walletPlateNumber: LocatorObject = {
  locator:
    '.WalletRow_nameSection .NavPlate_wrapper .NavPlate_content .NavPlate_head .NavPlate_plate',
  method: 'css',
};
const walletButton: LocatorObject = {
  locator: '//button[@class="WalletRow_nameSection" and @type="button"]',
  method: 'xpath',
};

export async function getWalletButtonByPlate(
  customWorld: Object,
  walletWantedPlate: string
): Promise<WebElement> {
  const allRows = await customWorld.driver.findElements(
    getMethod(walletRow.method)(walletRow.locator)
  );
  for (const walletRowElement of allRows) {
    const walletRowPlate = await walletRowElement
      .findElement(getMethod(walletPlateNumber.method)(walletPlateNumber.locator))
      .getText();
    if (walletRowPlate === walletWantedPlate) {
      return await walletRowElement.findElement(
        getMethod(walletButton.method)(walletButton.locator)
      );
    }
  }

  throw new NoSuchElementError(`A wallet with the plate ${walletWantedPlate} is not found`);
}
