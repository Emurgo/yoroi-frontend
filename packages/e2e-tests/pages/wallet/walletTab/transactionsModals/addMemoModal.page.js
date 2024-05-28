import BasePage from '../../../basepage.js';

class AddMemoDialog extends BasePage {
  // locators
  // * modal window
  addMemoDialogWindowLocator = {
    locator: 'addMemoDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  // * modal title
  addMemoDialogTitleLocator = {
    locator: 'addMemoDialog-dialogTitle-text',
    method: 'id',
  };
  // * modal close button
  addMemoDialogCloseButtonLocator = {
    locator: 'addMemoDialog-closeModal-button',
    method: 'id',
  };
  // * input
  addMemoDialogInputLocator = {
    locator: '//input[starts-with(@id, "memoContent--")]',
    method: 'xpath',
  };
  // * input error
  addMemoDialogErrorTextLocator = {
    locator: '//input[starts-with(@id, "memoContent--") and contains(@id, "-helper-text")]',
    method: 'xpath',
  };

  // * add memo button
  addMemoDialogAddButtonLocator = {
    locator: 'addMemoDialog-add-button',
    method: 'id',
  };
  // methods
  // * isDisplayed
  async isDisplayed() {
    this.logger.info(`AddMemoDialog::isDisplayed is called`);
    try {
      await this.waitForElement(this.addMemoDialogWindowLocator);
      await this.waitForElement(this.addMemoDialogTitleLocator);
      return true;
    } catch (error) {
      return false;
    }
  }
  // * close memo modal
  async closeMemoModal() {
    this.logger.info(`AddMemoDialog::closeMemoModal is called`);
    await this.click(this.addMemoDialogCloseButtonLocator);
  }
  // * enter memo
  async enterMemo(memoText) {
    this.logger.info(`AddMemoDialog::enterMemo is called. Memo text: ${memoText}`);
    await this.input(this.addMemoDialogInputLocator, memoText);
  }
  // * get error message
  async getMemoErrorMsg() {
    this.logger.info(`AddMemoDialog::getMemoErrorMsg is called.`);
    await this.waitElementTextMatches(this.addMemoDialogErrorTextLocator, /\w+/g);
    return await this.getText(this.addMemoDialogErrorTextLocator);
  }

  // * press add
  async pressAdd() {
    this.logger.info(`AddMemoDialog::getMemoErrorMsg is called.`);
    await this.click(this.addMemoDialogAddButtonLocator);
  }
}

export default AddMemoDialog;
