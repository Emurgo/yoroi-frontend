import {
  defaultWaitTimeout,
  fiveSeconds,
  quarterSecond,
} from '../../../../helpers/timeConstants.js';
import BasePage from '../../../basepage.js';

class DeleteMemoModal extends BasePage {
  // locators
  deleteDialogWindowLocator = {
    locator: 'deleteMemoDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  deleteDialogTitleLocator = {
    locator: 'deleteMemoDialog-dialogTitle-text',
    method: 'id',
  };
  deleteDialogCloseButtonLocator = {
    locator: 'deleteMemoDialog-closeModal-button',
    method: 'id',
  };
  cancelButtonLocator = {
    locator: 'deleteMemoDialog-cancel-button',
    method: 'id',
  };
  deleteButtonLocator = {
    locator: 'deleteMemoDialog-delete-button',
    method: 'id',
  };
  // methods
  // * isDisplayed
  async isDisplayed() {
    this.logger.info(`DeleteMemoModal::isDisplayed is called`);
    const windowState = await this.customWaitIsPresented(
      this.deleteDialogWindowLocator,
      fiveSeconds,
      quarterSecond
    );
    const titleState = await this.customWaitIsPresented(
      this.deleteDialogTitleLocator,
      fiveSeconds,
      quarterSecond
    );
    return windowState && titleState;
  }
  // * modal is not displayed
  async isNotDisplayed() {
    this.logger.info(`DeleteMemoModal::isNotDisplayed is called`);
    const notPresented = await this.customWaiter(
      async () => {
        const allElements = await this.findElements(this.deleteDialogWindowLocator);
        return allElements.length === 0;
      },
      defaultWaitTimeout,
      quarterSecond
    );
    if (!notPresented) {
      throw new Error('The Delete Memo modal is still displayed after 10 seconds');
    }
  }
  // * cancel
  async pressCancel() {
    this.logger.info(`DeleteMemoModal::pressCancel is called`);
    await this.click(this.cancelButtonLocator);
  }
  // * close
  async closeDialog() {
    this.logger.info(`DeleteMemoModal::closeDialog is called`);
    await this.click(this.deleteDialogCloseButtonLocator);
  }
  // * delete
  async confirmDeleting() {
    this.logger.info(`DeleteMemoModal::confirmDeleting is called`);
    await this.click(this.deleteButtonLocator);
  }
}

export default DeleteMemoModal;
