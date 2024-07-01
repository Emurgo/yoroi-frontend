import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import driversPoolsManager from '../utils/driversPool.js';
import AddNewWallet from '../pages/addNewWallet.page.js';

describe('Deleting a memo', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  const oldMemo = 'j1hKEo4Er4FDLFAtGBo07jIcXBSOqx9D16U0sUIl';

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
  });

  it('Prepare DB and storages', async function () {
    const addWalletPage = new AddNewWallet(webdriver, logger);
    const state = await addWalletPage.isDisplayed();
    expect(state).to.be.true;
    await addWalletPage.prepareDBAndStorage('testWallet1MemoAdded');
    await addWalletPage.refreshPage();
  });

  it('Check transactions page', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.waitPrepareWalletBannerIsClosed();
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
  });

  it('Expand tx', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.clickOnTxRow(0, 0);
  });

  it('Delete memo', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const memoMessage = await transactionsPage.getMemoMessage(0, 0);
    expect(memoMessage).to.equal(oldMemo);

    // click edit memo
    const memoWarningModal = await transactionsPage.clickEditMemo(0, 0);
    const warningIsDisplayed = await memoWarningModal.isDisplayed();
    expect(warningIsDisplayed).to.be.true;

    const editMemoModal = await memoWarningModal.understandEditing();
    const editMemoModalIsDisplayed = await editMemoModal.isDisplayed();
    expect(editMemoModalIsDisplayed).to.be.true;

    // click delete memo
    await editMemoModal.deleteMemo();
  });

  // check the memo displayed message
  it('Check deleted memo', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.clickOnTxRow(0, 0);
    const noMemo = await transactionsPage.thereIsNoMemo(0, 0);
    expect(noMemo).to.be.true;
    const memosInDB = await transactionsPage.getInfoFromIndexedDB('TxMemo');
    expect(memosInDB.length).to.equal(0);
  });

  // reload the page
  it('Refresh page', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.refreshPage();
  });

  // check the memo displayed message again
  it('Check deleted memo again', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.clickOnTxRow(0, 0);
    const noMemo = await transactionsPage.thereIsNoMemo(0, 0);
    expect(noMemo).to.be.true;
  });

  afterEach(function (done) {
    customAfterEach(this, webdriver, logger);
    done();
  });

  after(function (done) {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
    done();
  });
});
