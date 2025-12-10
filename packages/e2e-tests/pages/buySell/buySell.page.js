import { defaultWaitTimeout, fiveSeconds, halfSecond, quarterSecond, threeSeconds, twoSeconds } from '../../helpers/timeConstants.js';
import BasePage from '../basepage.js';
import { ElementLocator } from '../locator.js';

class BuySell extends BasePage {
  // locators
  /**
   * @type {ElementLocator}
   */
  modalWindowLocator = {
    locator: 'buySell-dialogWindow-modalWindow',
    method: 'id',
  };
  /**
   * @type {ElementLocator}
   */
  modalTitleLocator = {
    locator: 'buySell-dialogTitle-text',
    method: 'id',
  };
  /**
   * @type {ElementLocator}
   */
  closeModalBtnLocator = {
    locator: 'buySell-closeModal-button',
    method: 'id',
  };
  /**
   * @type {ElementLocator}
   */
  proceedBtnLocator = {
    locator: 'buySell-proceed-button',
    method: 'id',
  };
  /**
   * @type {ElementLocator}
   */
  buyTabBtnLocator = {
    locator: 'buySell-selectBuyAda-button',
    method: 'id',
  };
  /**
   * @type {ElementLocator}
   */
  sellTabBtnLocator = {
    locator: 'buySell-selectSellAda-button',
    method: 'id',
  };
  /**
   * @type {ElementLocator}
   */
  adaAmountInputLocator = {
    locator: 'buySell-adaAmount-input',
    method: 'id',
  };
  /**
   * @type {ElementLocator}
   */
  adaAmountHelperTextLocator = {
    locator: 'buySell-adaAmount-input-helper-text',
    method: 'id',
  };
  /**
   * @type {ElementLocator}
   */
  providerNameLocator = {
    locator: 'buySell-providerName-text',
    method: 'id',
  };
  /**
   * @type {ElementLocator}
   */
  providerFeeLocator = {
    locator: 'buySell-providerFee-text',
    method: 'id',
  };
  // methods
  async isDisplayed() {
    this.logger.info(`BuySell::isDisplayed is called`);
    const modalWindowPromise = this.customWaitIsPresented(this.modalWindowLocator, defaultWaitTimeout, quarterSecond);
    const titlePromise = this.customWaitIsPresented(this.modalTitleLocator, defaultWaitTimeout, quarterSecond);
    const closeBtnPromise = this.customWaitIsPresented(this.closeModalBtnLocator, defaultWaitTimeout, quarterSecond);
    const states = await Promise.all([modalWindowPromise, titlePromise, closeBtnPromise]);

    return states.every(state => state === true);
  }
  async closeModal() {
    this.logger.info(`BuySell::closeModal is called`);
    await this.click(this.closeModalBtnLocator);
    const isClosed = await this.customWaitIsNotPresented(this.modalWindowLocator, fiveSeconds, quarterSecond);
    this.logger.info(`BuySell::closeModal. Modal is closed: ${isClosed}`);
    return isClosed
  }
  async enterAdaAmount(amount) {
    this.logger.info(`BuySell::enterAdaAmount is called. Amount ${amount}`);
    await this.input(this.adaAmountInputLocator, amount);
  }
  async getHelperText() {
    this.logger.info(`BuySell::getHelperText is called`);
    const messageAppeared = await this.customWaiter(
      async () => {
        const currentText = await this.getText(this.adaAmountHelperTextLocator);
        return currentText !== '';
      },
      threeSeconds,
      quarterSecond
    );
    if (messageAppeared) {
      return await this.getText(this.adaAmountHelperTextLocator);
    }
    return '';
  }
  async getProviderInfo() {
    this.logger.info(`BuySell::getProviderInfo is called`);
    const providerNamePromise = this.getText(this.providerNameLocator);
    const providerFeePromise = this.getText(this.providerFeeLocator);
    const [name, feeRawText] = await Promise.all([providerNamePromise, providerFeePromise]);
    const fee = Number(feeRawText.split(' ')[0].slice(0, -1));

    return { name, fee };
  }
  async selectBuyTab() {
    this.logger.info(`BuySell::selectBuyTab is called`);
    return await this.selectTab(this.buyTabBtnLocator);
  }
  async selectSellTab() {
    this.logger.info(`BuySell::selectSellTab is called`);
    return await this.selectTab(this.sellTabBtnLocator);
  }
  async selectTab(tabBtnLocator) {
    this.logger.info(`BuySell::selectTab is called. Locator: ${JSON.stringify(tabBtnLocator)}`);
    await this.click(tabBtnLocator);
    return await this.customWaiter(async () => {
      const btnIsSelected = await this.getAttribute(tabBtnLocator, 'aria-selected');
      return btnIsSelected === 'true';
    });
  }
  async isProceedBtnDisabled() {
    this.logger.info(`BuySell::isProceedBtnDisabled is called`);
    return await this.buttonIsDisabled(this.proceedBtnLocator, twoSeconds, halfSecond);
  }
  async isProceedBtnEnabled() {
    this.logger.info(`BuySell::isProceedBtnEnabled is called`);
    return await this.buttonIsEnabled(this.proceedBtnLocator, twoSeconds, halfSecond);
  }
  async proceed() {
    this.logger.info(`BuySell::proceed is called`);
    await this.click(this.proceedBtnLocator);
  }
}

export default BuySell;
