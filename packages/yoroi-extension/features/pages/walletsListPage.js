// @flow
// Revamped wallets list elements
import { getMethod } from '../support/helpers/helpers';

const walletRow = { locator: '.WalletRow_content', method: 'css' };
const walletPlateNumber = {
  locator:
    '.WalletRow_nameSection .NavPlate_wrapper .NavPlate_content .NavPlate_head .NavPlate_plate',
  method: 'css',
};
const walletButton = {
  locator: '//button[@class="WalletRow_nameSection" and @type="button"]',
  method: 'xpath',
};

export const getWalletButtonByPlate = async (customWorld: Object, walletWantedPlate: string) => {
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
};
