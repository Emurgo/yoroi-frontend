import { fiveSeconds, quarterSecond } from '../../../../helpers/timeConstants.js';
import BasePage from '../../../basepage.js';
import DeleteMemoModal from './deleteMemoModal.page.js';

class EditMemoDialog extends BasePage {
  // locators
  // * modal window
  editMemoDialogWindowLocator = {
    locator: 'editMemoDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  // * modal title
  editMemoDialogTitleLocator = {
    locator: 'editMemoDialog-dialogTitle-text',
    method: 'id',
  };
  // * modal close button
  editMemoDialogCloseButtonLocator = {
    locator: 'editMemoDialog-closeModal-button',
    method: 'id',
  };
  // * input
  editMemoDialogInputLocator = {
    locator: '//input[starts-with(@id, "memoContent--")]',
    method: 'xpath',
  };
  // * input error
  editMemoDialogErrorTextLocator = {
    locator: '//input[starts-with(@id, "memoContent--") and contains(@id, "-helper-text")]',
    method: 'xpath',
  };
  // * delete memo
  editMemoDialogDeleteButtonLocator = {
    locator: 'editMemoDialog:input-deleteMemo-button',
    method: 'id',
  };
  // * save memo button
  editMemoDialogSaveButtonLocator = {
    locator: 'editMemoDialog-save-button',
    method: 'id',
  };
  // methods
  // * isDisplayed
  async isDisplayed() {
    this.logger.info(`EditMemoDialog::isDisplayed is called`);
    try {
      await this.waitForElement(this.editMemoDialogWindowLocator);
      await this.waitForElement(this.editMemoDialogTitleLocator);
      return true;
    } catch (error) {
      return false;
    }
  }
  // * close memo modal
  async closeMemoModal() {
    this.logger.info(`EditMemoDialog::closeMemoModal is called`);
    await this.click(this.editMemoDialogCloseButtonLocator);
  }
  // * enter memo
  async enterMemo(memoText) {
    this.logger.info(`EditMemoDialog::enterMemo is called. Memo text: ${memoText}`);
    await this.click(this.editMemoDialogInputLocator);
    await this.clearInputAll(this.editMemoDialogInputLocator);
    await this.input(this.editMemoDialogInputLocator, memoText);
  }
  // * get error message
  async getMemoErrorMsg() {
    this.logger.info(`EditMemoDialog::getMemoErrorMsg is called.`);
    await this.waitElementTextMatches(this.editMemoDialogErrorTextLocator, /\w+/g);
    return await this.getText(this.editMemoDialogErrorTextLocator);
  }

  // * press save
  async pressSave() {
    this.logger.info(`EditMemoDialog::pressSave is called.`);
    await this.click(this.editMemoDialogSaveButtonLocator);
    const modalIsNotDisplayed = await this.customWaitIsNotPresented(
      this.editMemoDialogWindowLocator,
      fiveSeconds,
      quarterSecond
    );

    if (!modalIsNotDisplayed) {
      throw new Error('Save memo modal is still displayed after 5 seconds');
    }
  }

  // * delete message by pressing cross button
  async deleteMemo(confrimDeleting = true) {
    this.logger.info(`EditMemoDialog::deleteMemo is called`);
    await this.click(this.editMemoDialogDeleteButtonLocator);
    const deleteModal = new DeleteMemoModal(this.driver, this.logger);
    const deleteModalState = await deleteModal.isDisplayed();
    if (!deleteModalState) {
      throw new Error('Save memo modal is still displayed after 5 seconds');
    }
    if (confrimDeleting) {
      await deleteModal.confirmDeleting();
      await deleteModal.isNotDisplayed();
    } else {
      await deleteModal.pressCancel();
    }
  }
}

export default EditMemoDialog;
