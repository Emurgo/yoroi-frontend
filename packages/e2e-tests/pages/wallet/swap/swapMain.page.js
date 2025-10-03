import WalletCommonBase from '../../walletCommonBase.page.js';
import { ElementLocator } from '../../locator.js';
import { pageTitle } from '../../../helpers/pageTitles.js';
import { halfMinute, halfSecond } from '../../../helpers/timeConstants.js';

export default class SwapMain extends WalletCommonBase {
  // locators
  /** @type {ElementLocator} */
  assetsSwapSubMenuBtnLocator = {
    locator: 'swap-swapSubTab-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  orderSubMenuBtnLocator = {
    locator: 'swap-ordersSubTab-button',
    method: 'id',
  };
  // methods
  async isDisplayed() {
    const states = await Promise.all([
      this.titleIsCorrect(pageTitle.swap),
      this.customWaitIsPresented(this.assetsSwapSubMenuBtnLocator, halfMinute, halfSecond),
      this.customWaitIsPresented(this.orderSubMenuBtnLocator, halfMinute, halfSecond),
    ]);
    return states.every(state => state === true);
  }
}
