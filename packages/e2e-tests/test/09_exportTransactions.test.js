import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1 } from '../utils/testWallets.js';
import { expect } from 'chai';
import {
  cleanDownloads,
  getDownloadedFileContent,
  getListOfDownloadedFiles,
  getTestLogger,
  getTodayStr,
  parseExportedCSV,
} from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import driversPoolsManager from '../utils/driversPool.js';
import { compareExportedTxsAndDisplayedTxs } from '../helpers/customChecks.js';
import AddNewWallet from '../pages/addNewWallet.page.js';

describe('Export transactions, positive', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(function () {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    cleanDownloads();
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

  // Open the export txs modal window
  it('Open the export modal window', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const exportDialog = await transactionsPage.openExportModalWindow();
    const exportDialogIsDisplayed = await exportDialog.isDisplayed();
    expect(exportDialogIsDisplayed, 'Something wrong with Export Transaction Dialog').to.be.true;
  });
  // set dates
  // export txs
  it('Set correct dates', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const exportDialog = transactionsPage.getExportDialog();
    // mm/dd/yyyy - 11/13/2023, it is only for testWallet1
    await exportDialog.setStartDate('11132023');
    // mm/dd/yyyy - 03/08/2024, it is only for testWallet1
    await exportDialog.setEndDate('03082024');
    await exportDialog.clickIncludeTxsIDs();
    const btnEnabled = await exportDialog.exportButtonIsEnabled();
    expect(btnEnabled, 'The export button is not enabled').to.be.true;
    await exportDialog.exportTransactionsFile();
  });
  // Check the exported file
  it('Checking the exported file', async function () {
    // check file exists
    const allDownloadedFiles = getListOfDownloadedFiles();
    expect(allDownloadedFiles.length).to.equal(1);
    // check file name
    const fileName = allDownloadedFiles[0];
    const todayStr = getTodayStr();
    const expectedFileName = `Yoroi-Transaction-History_ADA-${testWallet1.plate}_${todayStr}.csv`;
    expect(fileName, 'Exported file name is different').to.equal(expectedFileName);
    // check exported file content
    const fileContent = getDownloadedFileContent(fileName);
    const parsedFileContent = parseExportedCSV(fileContent);
    // get txs info from the transactions page <list of objects>
    expect(parsedFileContent.length, 'Something wrong in the exported file').to.equal(2);
  });

  it('Compare displayed txs with the exported txs', async function () {
    const allDownloadedFiles = getListOfDownloadedFiles();
    const fileName = allDownloadedFiles[0];
    const fileContent = getDownloadedFileContent(fileName);
    const parsedFileContent = parseExportedCSV(fileContent);

    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const displayedTxs = await transactionsPage.getTxsInfo();
    compareExportedTxsAndDisplayedTxs(parsedFileContent, displayedTxs);
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
