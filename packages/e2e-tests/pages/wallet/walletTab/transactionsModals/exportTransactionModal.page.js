import BasePage from '../../../basepage.js';
import { twoSeconds, quarterSecond } from '../../../../helpers/timeConstants.js';

class ExportTransactionsModal extends BasePage {
  // locators
  exportDialogWindowLocator = {
    locator: 'exportTransactionsDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  exportDialogTitleLocator = {
    locator: 'exportTransactionsDialog-dialogTitle-text',
    method: 'id',
  };
  exportStartDateInputLocator = {
    locator: '//div[contains(@class, "exportTransactionsDialog-startDate-datePicker")]/div/input',
    method: 'xpath',
  };
  exportStartDateFieldsetLocator = {
    locator:
      '//div[contains(@class, "exportTransactionsDialog-startDate-datePicker")]/div/fieldset',
    method: 'xpath',
  };
  exportEndDateInputLocator = {
    locator: '//div[contains(@class, "exportTransactionsDialog-endDate-datePicker")]/div/input',
    method: 'xpath',
  };
  exportEndDateFiedlsetInputLocator = {
    locator: '//div[contains(@class, "exportTransactionsDialog-endDate-datePicker")]/div/fieldset',
    method: 'xpath',
  };
  includeTxIdCheckboxLocator = {
    locator: 'exportTransactionsDialog-includeTxIds-checkbox',
    method: 'id',
  };
  exportTransactionsButtonLocator = {
    locator: 'exportTransactionsDialog-export-button',
    method: 'id',
  };
  exportErrorMessageLocator = {
    locator: '.ErrorBlock_component',
    method: 'css',
  };
  // methods
  async isDisplayed() {
    this.logger.info(`ExportTransactionsModal::isDisplayed is called`);
    try {
      await this.findElement(this.exportDialogWindowLocator);
      await this.findElement(this.exportDialogTitleLocator);
      await this.findElement(this.exportStartDateInputLocator);
      await this.findElement(this.exportEndDateInputLocator);

      return true;
    } catch (error) {
      this.logger.warn(
        `ExportTransactionsModal::isDisplayed there is something wrong with Export Transaction Dialog`
      );
      return false;
    }
  }
  async setStartDate(dateString) {
    this.logger.info(`ExportTransactionsModal::setStartDate is called`);
    await this.click(this.exportStartDateInputLocator);
    await this.input(this.exportStartDateInputLocator, dateString);
  }
  async checkStartDateErrorMsg() {
    this.logger.info(`ExportTransactionsModal::checkStartDateErrorMsg is called`);
    throw new Error('The function is not implemented yet');
  }
  async setEndDate(dateString) {
    this.logger.info(`ExportTransactionsModal::setEndDate is called`);
    await this.click(this.exportEndDateInputLocator);
    await this.input(this.exportEndDateInputLocator, dateString);
  }
  async checkEndDateErrorMsg() {
    this.logger.info(`ExportTransactionsModal::checkEndDateErrorMsg is called`);
    throw new Error('The function is not implemented yet');
  }
  async clickIncludeTxsIDs() {
    this.logger.info(`ExportTransactionsModal::tickIncludeTxsIDs is called`);
    await this.click(this.includeTxIdCheckboxLocator);
  }
  async exportButtonIsEnabled() {
    const buttonIsEnabled = await this.customWaiter(
      async () => {
        const buttonlIsEnabled = await this.getAttribute(
          this.exportTransactionsButtonLocator,
          'disabled'
        );
        return buttonlIsEnabled === null;
      },
      twoSeconds,
      quarterSecond
    );

    return buttonIsEnabled;
  }
  async exportTransactionsFile() {
    this.logger.info(`ExportTransactionsModal::exportTransactionsFile is called`);
    await this.click(this.exportTransactionsButtonLocator);
    await this.sleep(twoSeconds + twoSeconds);
  }
  async getStartDateInputBorderColor() {
    this.logger.info(`ExportTransactionsModal::getStartDateInputBorderColor is called`);
    return await this.getCssValue(this.exportStartDateFieldsetLocator, 'border-color');
  }
  async getEndDateInputBorderColor() {
    this.logger.info(`ExportTransactionsModal::getEndDateInputBorderColor is called`);
    return await this.getCssValue(this.exportEndDateFiedlsetInputLocator, 'border-color');
  }
  async getErrorMessage() {
    this.logger.info(`ExportTransactionsModal::getErrorMessage is called`);
    return await this.getText(this.exportErrorMessageLocator);
  }
}

export default ExportTransactionsModal;
