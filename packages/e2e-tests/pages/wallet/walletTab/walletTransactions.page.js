import {
  defaultWaitTimeout,
  fiveSeconds,
  quarterSecond,
  twoSeconds,
} from '../../../helpers/timeConstants.js';
import BasePage from '../../basepage.js';
import WalletTab from './walletTab.page.js';
import { convertPrettyDateToNormal, convertPrettyTimeToNormal } from '../../../utils/utils.js';

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

export class TransactionsSubTab extends WalletTab {
  // locators
  // export button
  exportTransactionsButtonLocator = {
    locator: 'wallet:transactions:walletSummary-openExportWindow-button',
    method: 'id',
  };
  walletSummaryBoxLocator = {
    locator: 'wallet:transactions-walletSummary-box',
    method: 'id',
  };
  walletTxListBoxLocator = {
    locator: 'wallet:transaction-transactionsList-box',
    method: 'id',
  };
  walletTransactionsGroupBoxLocator = index => {
    return {
      locator: `wallet:transactions:transactionsList-transactionsGroup_${index}-box`,
      method: 'id',
    };
  };
  walletTransactionsGroupDateTextLocator = index => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${index}-date-text`,
      method: 'id',
    };
  };
  async __getTxsGroups() {
    const locatorForAllGroups = {
      locator: '//div[starts-with(@id, "wallet:transactions:transactionsList-transactionsGroup_")]',
      method: 'xpath',
    };
    const result = [];
    const allGroups = await this.findElements(locatorForAllGroups);
    for (let groupIndex = 0; groupIndex < allGroups.length; groupIndex++) {
      const groupDatePrettified = await this.getText(
        this.walletTransactionsGroupDateTextLocator(groupIndex)
      );
      const groupDate = convertPrettyDateToNormal(groupDatePrettified);
      result.push({
        groupDate,
        groupIndex,
      });
    }
    return result;
  }
  /**
   * The method collect all txs info inside a group
   * @param {({groupDate: string, groupIndex: number})} groupObject An group object which contains such properties as groupDate and groupIndex
   * @returns {Promise<Array<{txType: string, txTime: string, txDateTime: string, txStatus: string, txFee: number, txAmount: number, txHashId: string}>>}
   */
  async __getAllTxsInGroup(groupObject) {
    const { groupDate, groupIndex } = groupObject;
    const result = [];
    const allTxs = await this.findElements(this.txsInGroupLocator(groupIndex));
    for (let txIndex = 0; txIndex < allTxs.length; txIndex++) {
      const txType = await this.getText(this.txTypeTextLocator(groupIndex, txIndex));
      const txTimePrettified = await this.getText(this.txTimeTextLocator(groupIndex, txIndex));
      const txTime = convertPrettyTimeToNormal(txTimePrettified);
      const txDateTime = `${groupDate} ${txTime}`;
      const txStatus = await this.getText(this.txStatusTextLocator(groupIndex, txIndex));
      const txFeeString = await this.getText(this.txFeeTextLocator(groupIndex, txIndex));
      let txFee = 0;
      if (txFeeString !== '-') {
        txFee = parseFloat(txFeeString.split(' ')[0]);
      }
      const txAmountString = await this.getText(this.txAmountTextLocator(groupIndex, txIndex));
      const txAmount = parseFloat(txAmountString.split(' ')[0]);
      await this.click(this.txRowLocator(groupIndex, txIndex));
      const txHashId = await this.getText(this.txHashIdTextLocator(groupIndex, txIndex));
      await this.click(this.txRowLocator(groupIndex, txIndex));
      const txInfo = {
        txType,
        txTime,
        txDateTime,
        txStatus,
        txFee,
        txAmount,
        txHashId,
      };
      result.push(txInfo);
    }
    return result;
  }
  txsInGroupLocator = groupIndex => {
    return {
      locator: `//div[starts-with(@id, "wallet:transactions:transactionsList:transactionsGroup_${groupIndex}-transaction_")]`,
      method: 'xpath',
    };
  };
  txRowLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}-transaction_${txIndex}-box`,
      method: 'id',
    };
  };
  txTypeTextLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}-txType-text`,
      method: 'id',
    };
  };
  txTimeTextLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}-txTime-text`,
      method: 'id',
    };
  };
  txStatusTextLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}-txStatus-text`,
      method: 'id',
    };
  };
  txFeeTextLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}-txFee-text`,
      method: 'id',
    };
  };
  txAmountTextLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}-txAmount-text`,
      method: 'id',
    };
  };
  txAmountAssetsTextLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}-txAmountAssets-text`,
      method: 'id',
    };
  };
  txCertificateTextLocator = (groupIndex, txIndex, certIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}:txFullInfo-txCertificate_${certIndex}-text`,
      method: 'id',
    };
  };
  txConfirmationsTextLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}:txFullInfo-numberOfConfirmations-text`,
      method: 'id',
    };
  };
  txHashIdTextLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}:txFullInfo-transactionId-text`,
      method: 'id',
    };
  };
  txAddMemoButtonLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}:txFullInfo-addMemo-button`,
      method: 'id',
    };
  };
  txEditMemoButtonLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}:txFullInfo-editMemo-button`,
      method: 'id',
    };
  };
  txMemoContentTextLocator = (groupIndex, txIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}:txFullInfo-memoContent-text`,
      method: 'id',
    };
  };
  // 'wallet is empty' banner
  walletEmptyBannerLocator = {
    locator: 'walletEmptyBanner',
    method: 'id',
  };
  // transaction
  transactionRowLocator = {
    locator: '.Transaction_component',
    method: 'css',
  };
  transactionTxStatusLocator = {
    locator: 'txStatus',
    method: 'id',
  };
  transactionAmountLocator = {
    locator: 'transactionAmount',
    method: 'id',
  };
  // show more button
  showMoreTxsButtonLocator = {
    locator: 'wallet:transactions:transactionsList-showMoreTxs-button',
    method: 'id',
  };
  txsLoaderSpinnerLocator = {
    locator: 'wallet:transactions:transactionsList-loadingSpinner-component',
    method: 'id',
  };
  // methods
  async isDisplayed() {
    this.logger.info(`TransactionsSubTab::isDisplayed is called`);
    try {
      await this.waitForElement(this.transactionsSubmenuItemLocator);
      await this.waitForElement(this.walletSummaryBoxLocator);
      return true;
    } catch (error) {
      return false;
    }
  }
  async isWalletEmpty() {
    this.logger.info(`TransactionsSubTab::isWalletEmpty is called`);
    const emptyBannerIsDisplayed = await (
      await this.findElement(this.walletEmptyBannerLocator)
    ).isDisplayed();
    const displayedTxs = await this.findElements(this.transactionRowLocator);
    return emptyBannerIsDisplayed && displayedTxs.length == 0;
  }
  async getLastTx() {
    this.logger.info(`TransactionsSubTab::getLastTx is called`);
    throw new Error('The function is not implemented yet');
  }
  async openExportModalWindow() {
    this.logger.info(`TransactionsSubTab::openExportModalWindow is called`);
    await this.click(this.exportTransactionsButtonLocator);

    return new ExportTransactionsModal(this.driver, this.logger);
  }
  getExportDialog() {
    this.logger.info(`TransactionsSubTab::getExportDialog is called`);
    return new ExportTransactionsModal(this.driver, this.logger);
  }
  async getTxsInfo() {
    this.logger.info(`TransactionsSubTab::getTxsInfo is called`);
    const allGroups = await this.__getTxsGroups();
    const allTxsInfo = [];
    for (const group of allGroups) {
      const txsInfoInGroup = await this.__getAllTxsInGroup(group);
      allTxsInfo.push(...txsInfoInGroup);
    }
    return allTxsInfo;
  }
  async getAmountOfTxs() {
    this.logger.info(`TransactionsSubTab::getAmountOfTxs is called`);
    let txsAmount = 0;
    const allGroups = await this.__getTxsGroups();
    for (const txGroup of allGroups) {
      const allTxs = await this.findElements(this.txsInGroupLocator(txGroup.groupIndex));
      txsAmount = txsAmount + allTxs.length;
    }
    return txsAmount;
  }
  async showMoreBtnIsDisplayed() {
    this.logger.info(`TransactionsSubTab::showMoreBtnIsDisplayed is called`);
    await this.driver.manage().setTimeouts({ implicit: twoSeconds });
    try {
      await (await this.findElement(this.showMoreTxsButtonLocator)).isDisplayed();
      this.logger.info(`TransactionsSubTab::showMoreBtnIsDisplayed is displayed`);
      await this.driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
      return true;
    } catch (error) {
      this.logger.warn(`TransactionsSubTab::showMoreBtnIsDisplayed is not displayed`);
      await this.driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
      return false;
    }
  }
  async loaderIsDisplayed() {
    this.logger.info(`TransactionsSubTab::loaderIsDisplayed is called`);
    await this.driver.manage().setTimeouts({ implicit: twoSeconds });
    try {
      await (await this.findElement(this.txsLoaderSpinnerLocator)).isDisplayed();
      this.logger.info(`TransactionsSubTab::loaderIsDisplayed is displayed`);
      await this.driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
      return true;
    } catch (error) {
      this.logger.warn(`TransactionsSubTab::loaderIsDisplayed is not displayed`);
      await this.driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
      return false;
    }
  }
  async waitLoaderIsNotDisplayed(timeout, repearPeriod) {
    const loaderIsNotDisplayed = await this.customWaiter(
      async () => {
        const displayed = await this.loaderIsDisplayed();
        return !displayed;
      },
      timeout,
      repearPeriod
    );

    return loaderIsNotDisplayed;
  }
  async downloadAllTxs() {
    while (true) {
      const showMoreIsDisplayed = this.showMoreBtnIsDisplayed();
      const loaderIsDisplayed = this.loaderIsDisplayed();
      if (!(await showMoreIsDisplayed) && !(await loaderIsDisplayed)) {
        break;
      }
      if (await showMoreIsDisplayed) {
        await this.scrollIntoView(this.showMoreTxsButtonLocator);
        await this.click(this.showMoreTxsButtonLocator);
        await this.sleep(quarterSecond);
        continue;
      }
      if (await loaderIsDisplayed) {
        await this.scrollIntoView(this.txsLoaderSpinnerLocator);
        const result = await this.waitLoaderIsNotDisplayed(fiveSeconds, quarterSecond);
        if (!result) {
          throw new Error(`Transactions are still loading after ${fiveSeconds / 1000} seconds`);
        }
      }
    }
  }
}

export default TransactionsSubTab;
