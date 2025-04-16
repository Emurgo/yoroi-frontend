import BasePage from '../../basepage';
import { defaultWaitTimeout, quarterSecond } from '../../../helpers/timeConstants';

class TxSuccessModal extends BasePage {
  // locators
  modalWindowLocator = {
    locator: 'txSuccess-dialogWindow-presentation',
    method: 'id',
  };
  modalTitleLocator = {
    locator: 'txSuccess-modalTitle-text',
    method: 'id',
  };
  crossBtnLocator = {
    locator: 'txSuccess-closeModal-crossIconbutton',
    method: 'id',
  };
  closeBtnLocator = {
    locator: 'txSuccess-close-button',
    method: 'id',
  };
  // methods
  async isDisplayed() {
    this.logger.info(`TxSuccessModal::isDisplayed is called`);
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
    this.logger.info(`TxSuccessModal::closeWithCrossButton is called`);
    await this.click(this.crossBtnLocator);
  }
  async close() {
    this.logger.info(`TxSuccessModal::close is called`);
    await this.click(this.closeBtnLocator);
  }
}

export default TxSuccessModal;
