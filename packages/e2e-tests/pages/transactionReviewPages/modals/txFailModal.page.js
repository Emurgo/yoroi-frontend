import BasePage from '../../basepage.js';
import { defaultWaitTimeout, quarterSecond } from '../../../helpers/timeConstants.js';

class TxFailModal extends BasePage {
  // locators
  modalWindowLocator = {
    locator: 'txFail-dialogWindow-presentation',
    method: 'id',
  };
  modalTitleLocator = {
    locator: 'txFail-modalTitle-text',
    method: 'id',
  };
  crossBtnLocator = {
    locator: 'txFail-closeModal-crossIconbutton',
    method: 'id',
  };
  closeBtnLocator = {
    locator: 'txFail-close-button',
    method: 'id',
  };
  // methods
  async isDisplayed() {
    this.logger.info(`TxFailModal::isDisplayed is called`);
    const modalWindowPromise = this.customWaitIsPresented(
      this.modalWindowLocator,
      defaultWaitTimeout,
      quarterSecond
    );
    const titlePromise = this.customWaitIsPresented(
      this.modalTitleLocator,
      defaultWaitTimeout,
      quarterSecond
    );
    const [modalWindowState, titleState] = await Promise.all([modalWindowPromise, titlePromise]);

    return modalWindowState && titleState;
  }
  async closeWithCrossButton() {
    this.logger.info(`TxFailModal::closeWithCrossButton is called`);
    await this.click(this.crossBtnLocator);
  }
  async close() {
    this.logger.info(`TxFailModal::close is called`);
    await this.click(this.closeBtnLocator);
  }
}

export default TxFailModal;
