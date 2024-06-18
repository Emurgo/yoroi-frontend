import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1 } from '../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestString } from '../helpers/constants.js';
import AddNewWallet from '../pages/addNewWallet.page.js';

describe('Adding a memo to a completed Tx', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  const testMemoMessage = getTestString('', 40, true);

  before(function (done) {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    done();
  });

  it('Prepare DB and storages', async function () {
    const addWalletPage = new AddNewWallet(webdriver, logger);
    const state = await addWalletPage.isDisplayed();
    expect(state).to.be.true;
    await addWalletPage.prepareDBAndStorage('testWallet1');
    await addWalletPage.refreshPage();
  });

  it('Check transactions page', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.waitPrepareWalletBannerIsClosed();
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
  });

  // open the latests tx
  it('Expand tx', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.clickOnTxRow(0, 0);
  });
  // click the memo button
  // enter the memo
  // confirm saving the memo
  it('Add memo', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const memoWarningModal = await transactionsPage.clickAddMemo(0, 0);
    const warningIsDisplayed = await memoWarningModal.isDisplayed();
    expect(warningIsDisplayed).to.be.true;
    const addMemoModal = await memoWarningModal.understandAdding();
    const addMemoModalIsDisplayed = await addMemoModal.isDisplayed();
    expect(addMemoModalIsDisplayed).to.be.true;
    await addMemoModal.enterMemo(testMemoMessage);
    await addMemoModal.pressAdd();
  });
  // check the memo displayed message
  it('Check added memo', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const memoMessage = await transactionsPage.getMemoMessage(0, 0);
    const txHashId = await transactionsPage.getTxHashID(0, 0);
    expect(memoMessage).to.equal(testMemoMessage);
    const memosInDB = await transactionsPage.getInfoFromIndexedDB('TxMemo');
    expect(memosInDB.length).to.equal(1);
    const txMemoinDB = memosInDB[0].value;
    expect(txMemoinDB.Content).to.equal(testMemoMessage);
    expect(txMemoinDB.TransactionHash).to.equal(txHashId);
    expect(txMemoinDB.WalletId).to.equal(testWallet1.plate);
  });
  // reload the page
  it('Refresh page', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.refreshPage();
  });
  // check the memo displayed message again
  it('Check added memo again', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.clickOnTxRow(0, 0);
    const memoMessage = await transactionsPage.getMemoMessage(0, 0);
    expect(memoMessage).to.equal(testMemoMessage);
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
