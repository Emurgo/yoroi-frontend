import {
  fiveSeconds,
  quarterSecond,
  threeSeconds,
  twoSeconds,
} from '../../../helpers/timeConstants.js';
import WalletTab from './walletTab.page.js';
import ExportTransactionsModal from './transactionsModals/exportTransactionModal.page.js';
import { convertPrettyDateToNormal, convertPrettyTimeToNormal } from '../../../utils/utils.js';
import MemoWarningModal from './transactionsModals/memoWarningModal.page.js';

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
  txFromAddressTextLocator = (groupIndex, txIndex, fromAddressIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}:txFullInfo:fromAddresses:address_${fromAddressIndex}-address-text`,
      method: 'id',
    };
  };
  txToAddressTextLocator = (groupIndex, txIndex, toAddressIndex) => {
    return {
      locator: `wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}:txFullInfo:toAddresses:address_${toAddressIndex}-address-text`,
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
    const submenuState = await this.customWaitIsPresented(
      this.transactionsSubmenuItemLocator,
      fiveSeconds,
      quarterSecond
    );
    const summaryState = await this.customWaitIsPresented(
      this.walletSummaryBoxLocator,
      fiveSeconds,
      quarterSecond
    );

    return submenuState && summaryState;
  }
  async isWalletEmpty() {
    this.logger.info(`TransactionsSubTab::isWalletEmpty is called`);
    const emptyBannerIsDisplayed = await (
      await this.findElement(this.walletEmptyBannerLocator)
    ).isDisplayed();
    const displayedTxs = await this.findElements(this.transactionRowLocator);
    return emptyBannerIsDisplayed && displayedTxs.length == 0;
  }
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
  async getTxHashID(groupIndex, txIndex) {
    this.logger.info(
      `TransactionsSubTab::getTxHashID is called. Group index: ${groupIndex}, tx index: ${txIndex}`
    );
    const txHashId = await this.getText(this.txHashIdTextLocator(groupIndex, txIndex));
    this.logger.info(`TransactionsSubTab::getTxHashID::txHashId ${txHashId}`);
    return txHashId;
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
      const txHashId = await this.getTxHashID(groupIndex, txIndex);
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
  /**
   * Getting amount of addresses in the "from" section
   * @param {number} groupIndex Group index, starting from 0 (zero). Zero is the latest one
   * @param {number} txIndex Tx index, starting from 0 (zero), Zero is the top one
   * @returns {Promise<number>} Amount of addresses in the "from" section
   */
  async __getAmountOfFromAddresses(groupIndex, txIndex) {
    const fromAddrsLocator = {
      locator: `//div[starts-with(@id, "wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}:txFullInfo:fromAddresses:address_")]`,
      method: 'xpath',
    };
    const result = await this.findElements(fromAddrsLocator);
    return result.length;
  }
  /**
   * Getting amount of addresses in the "to" section
   * @param {number} groupIndex Group index, starting from 0 (zero). Zero is the latest one
   * @param {number} txIndex Tx index, starting from 0 (zero), Zero is the top one
   * @returns {Promise<number>} Amount of addresses in the "to" section
   */
  async __getAmountOfToAddresses(groupIndex, txIndex) {
    const toAddrsLocator = {
      locator: `//div[starts-with(@id, "wallet:transactions:transactionsList:transactionsGroup_${groupIndex}:transaction_${txIndex}:txFullInfo:toAddresses:address_")]`,
      method: 'xpath',
    };
    const result = await this.findElements(toAddrsLocator);
    return result.length;
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
    const state = await this.customWaitIsPresented(
      this.showMoreTxsButtonLocator,
      twoSeconds,
      quarterSecond
    );
    if (state) {
      this.logger.info(`TransactionsSubTab::showMoreBtnIsDisplayed is displayed`);
      return true;
    } else {
      this.logger.warn(`TransactionsSubTab::showMoreBtnIsDisplayed is not displayed`);
      return false;
    }
  }
  async loaderIsDisplayed() {
    this.logger.info(`TransactionsSubTab::loaderIsDisplayed is called`);
    const state = await this.customWaitIsPresented(
      this.txsLoaderSpinnerLocator,
      twoSeconds,
      quarterSecond
    );
    if (state) {
      this.logger.info(`TransactionsSubTab::loaderIsDisplayed is displayed`);
      return true;
    } else {
      this.logger.warn(`TransactionsSubTab::loaderIsDisplayed is not displayed`);
      return false;
    }
  }
  async waitLoaderIsNotDisplayed(timeout, repearPeriod) {
    this.logger.info(`TransactionsSubTab::waitLoaderIsNotDisplayed is called`);
    const loaderIsNotDisplayed = await this.customWaiter(
      async () => {
        const displayed = await this.loaderIsDisplayed();
        return !displayed;
      },
      timeout,
      repearPeriod
    );
    this.logger.info(
      `TransactionsSubTab::waitLoaderIsNotDisplayed::loaderIsNotDisplayed ${loaderIsNotDisplayed}`
    );

    return loaderIsNotDisplayed;
  }
  async _loadMore() {
    const showMoreIsDisplayed = this.showMoreBtnIsDisplayed();
    const loaderIsDisplayed = this.loaderIsDisplayed();
    if (!(await showMoreIsDisplayed) && !(await loaderIsDisplayed)) {
      return false;
    }
    if (await showMoreIsDisplayed) {
      await this.scrollIntoView(this.showMoreTxsButtonLocator);
      await this.click(this.showMoreTxsButtonLocator);
      await this.sleep(quarterSecond);
      return true;
    }
    if (await loaderIsDisplayed) {
      await this.scrollIntoView(this.txsLoaderSpinnerLocator);
      const result = await this.waitLoaderIsNotDisplayed(fiveSeconds, quarterSecond);
      if (!result) {
        throw new Error(`Transactions are still loading after ${fiveSeconds / 1000} seconds`);
      }
    }
  }
  async loadMoreTxs(amountOfLoads = 1) {
    this.logger.info(`TransactionsSubTab::loadMoreTxs is called. Amount of loads ${amountOfLoads}`);
    for (let tryNumber = 0; tryNumber < amountOfLoads; tryNumber++) {
      const canLoadMore = await this._loadMore();
      if (!canLoadMore) {
        break;
      }
    }
  }
  async downloadAllTxs() {
    this.logger.info(`TransactionsSubTab::downloadAllTxs is called`);
    let canLoadMore = true;
    while (canLoadMore) {
      canLoadMore = await this._loadMore();
    }
  }
  async __getAddrsLinks(groupIndex, txIndex, addrsAmount, getLocatorFunc) {
    this.logger.info(`TransactionsSubTab::__getAddrsLinks is called`);
    const links = [];

    for (let addrIndex = 0; addrIndex < addrsAmount; addrIndex++) {
      const addrLocator = getLocatorFunc(groupIndex, txIndex, addrIndex);
      const addrLink = await this.getLinkFromComponent(addrLocator);
      links.push(addrLink);
    }

    return links;
  }
  async clickOnTxRow(groupIndex, txIndex) {
    this.logger.info(
      `TransactionsSubTab::clickOnTxRow is called. Group index: ${groupIndex}, tx index: ${txIndex}`
    );
    const txRowLocator = this.txRowLocator(groupIndex, txIndex);
    await this.click(txRowLocator);
  }
  /**
   * Getting all links as strings from a selected tx
   * @param {number} groupIndex
   * @param {number} txIndex
   * @returns {Promise<{fromAddrsLinks: string[], toAddrsLinks: string[], txLink: string[]}>}
   */
  async getTxURLs(groupIndex, txIndex) {
    this.logger.info(
      `TransactionsSubTab::getTxURLs is called. Group index: ${groupIndex}, tx index: ${txIndex}`
    );
    await this.clickOnTxRow(groupIndex, txIndex);
    // from addresses
    const amountFromAddrs = await this.__getAmountOfFromAddresses(groupIndex, txIndex);
    const fromAddrsLinks = await this.__getAddrsLinks(
      groupIndex,
      txIndex,
      amountFromAddrs,
      this.txFromAddressTextLocator
    );
    // to addresses
    const amountToAddrs = await this.__getAmountOfToAddresses(groupIndex, txIndex);
    const toAddrsLinks = await this.__getAddrsLinks(
      groupIndex,
      txIndex,
      amountToAddrs,
      this.txToAddressTextLocator
    );
    // txHash link
    const txHashIdTextLocator = this.txHashIdTextLocator(groupIndex, txIndex);
    const txLinkElement = await this.getWebElementAbove(txHashIdTextLocator, 2);
    const txLink = [await this.getAttributeElement(txLinkElement, 'href')];

    return {
      fromAddrsLinks,
      toAddrsLinks,
      txLink,
    };
  }
  async clickAddMemo(groupIndex, txIndex) {
    this.logger.info(
      `TransactionsSubTab::clickAddMemo is called. Group index: ${groupIndex}, tx index: ${txIndex}`
    );
    const addMemoBtnLocator = this.txAddMemoButtonLocator(groupIndex, txIndex);
    await this.click(addMemoBtnLocator);
    return new MemoWarningModal(this.driver, this.logger);
  }
  async clickEditMemo(groupIndex, txIndex) {
    this.logger.info(
      `TransactionsSubTab::clickEditMemo is called. Group index: ${groupIndex}, tx index: ${txIndex}`
    );
    const editMemoBtnLocator = this.txEditMemoButtonLocator(groupIndex, txIndex);
    await this.click(editMemoBtnLocator);
    return new MemoWarningModal(this.driver, this.logger);
  }
  async getMemoMessage(groupIndex, txIndex) {
    this.logger.info(
      `TransactionsSubTab::getMemoMessage is called. Group index: ${groupIndex}, tx index: ${txIndex}`
    );
    const addMemoMsgLocator = this.txMemoContentTextLocator(groupIndex, txIndex);
    const result = await this.getText(addMemoMsgLocator);
    this.logger.info(`TransactionsSubTab::getMemoMessage::result ${result}`);
    return result;
  }
  async thereIsNoMemo(groupIndex, txIndex) {
    this.logger.info(
      `TransactionsSubTab::thereIsNoMemo is called. Group index: ${groupIndex}, tx index: ${txIndex}`
    );
    const memoMsgLocator = this.txMemoContentTextLocator(groupIndex, txIndex);
    const noMemoState = await this.customWaiter(
      async () => {
        const allElements = await this.findElements(memoMsgLocator);
        return allElements.length === 0;
      },
      threeSeconds,
      quarterSecond
    );
    return noMemoState;
  }
}

export default TransactionsSubTab;
