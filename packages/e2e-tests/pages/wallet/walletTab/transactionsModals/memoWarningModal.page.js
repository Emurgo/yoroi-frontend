import BasePage from '../../../basepage.js';
import AddMemoDialog from './addMemoModal.page.js';

class MemoWarningModal extends BasePage {
  // locators
  // * modal window
  memoWarningDialogWindowLocator = {
    locator: 'memoNoExternalStorageDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  // * modal title
  memoWarningDialogTitleLocator = {
    locator: 'memoNoExternalStorageDialog-dialogTitle-text',
    method: 'id',
  };
  // * modal close button
  memoWarningDialogCloseButtonLocator = {
    locator: 'memoNoExternalStorageDialog-closeModal-button',
    method: 'id',
  };
  // * cancelBtn
  cancelButtonLocator = {
    locator: 'memoNoExternalStorageDialog-cancel-button',
    method: 'id',
  };
  // * understandBtn
  undesrtandButtonLocator = {
    locator: 'memoNoExternalStorageDialog-iunderstand-button',
    method: 'id',
  };
  // methods
  // * isDisplayed
  async isDisplayed() {
    this.logger.info(`MemoWarningModal::isDisplayed is called`);
    try {
      await this.waitForElement(this.memoWarningDialogWindowLocator);
      await this.waitForElement(this.memoWarningDialogTitleLocator);
      return true;
    } catch (error) {
      return false;
    }
  }
  // * cancel
  async pressCancel() {
    this.logger.info(`MemoWarningModal::pressCancel is called`);
    await this.click(this.cancelButtonLocator);
  }
  // * close
  async closeWarningDialog() {
    this.logger.info(`MemoWarningModal::closeWarningDialog is called`);
    await this.click(this.memoWarningDialogCloseButtonLocator);
  }
  // * confirm
  async pressUnderstand() {
    this.logger.info(`MemoWarningModal::pressUnderstand is called`);
    await this.click(this.undesrtandButtonLocator);
    return new AddMemoDialog(this.driver, this.logger);
  }
}

export default MemoWarningModal;
