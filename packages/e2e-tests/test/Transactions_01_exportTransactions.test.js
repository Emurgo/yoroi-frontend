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
import { prepareWallet } from '../helpers/restoreWalletHelper.js';

// There is an issue https://emurgo.atlassian.net/browse/YOEXT-1589
describe('Export transactions, positive', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  // mm/dd/yyyy - 11/13/2023, it is only for testWallet1
  const startDate = '03262025';
  // mm/dd/yyyy - 03/08/2024, it is only for testWallet1
  const endDate = '03262025';

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    cleanDownloads();
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
    await exportDialog.setStartDate(startDate);
    await exportDialog.setEndDate(endDate);
    await exportDialog.clickIncludeTxsIDs();
    const btnEnabled = await exportDialog.exportButtonIsEnabled();
    expect(btnEnabled, 'The export button is not enabled').to.be.true;
    await exportDialog.exportTransactionsFile();
    const exportDialogState = await exportDialog.isNotDisplayed();
    expect(exportDialogState, 'The export dialog is still displayed').to.be.true;
  });
  // Check the exported file
  it('Checking the exported file', async function () {
    // check file exists
    const allDownloadedFiles = getListOfDownloadedFiles();
    expect(allDownloadedFiles.length).to.equal(1);
    // check file name
    const fileName = allDownloadedFiles[0];
    const todayStr = getTodayStr();
    const expectedFileName = `Yoroi-Transaction-History_TADA-${testWallet1.plate}_${todayStr}.csv`;
    expect(fileName, 'Exported file name is different').to.equal(expectedFileName);
    // check exported file content
    const fileContent = getDownloadedFileContent(fileName);
    const parsedFileContent = parseExportedCSV(fileContent);
    // get txs info from the transactions page <list of objects>
    expect(parsedFileContent.length, 'Something wrong in the exported file').to.equal(5);
  });

  it('Compare displayed txs with the exported txs', async function () {
    const allDownloadedFiles = getListOfDownloadedFiles();
    const fileName = allDownloadedFiles[0];
    const fileContent = getDownloadedFileContent(fileName);
    const parsedFileContent = parseExportedCSV(fileContent);

    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const displayedTxs = await transactionsPage.getTxsInfo(startDate, endDate);
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
