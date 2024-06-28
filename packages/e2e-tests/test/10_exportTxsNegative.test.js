import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import {
  cleanDownloads,
  getTestLogger,
  getListOfDownloadedFiles,
  isLinux,
  isHeadless,
} from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import driversPoolsManager from '../utils/driversPool.js';
import { Colors } from '../helpers/constants.js';
import AddNewWallet from '../pages/addNewWallet.page.js';

describe('Export transactions, negative cases', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
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

  describe('Both dates are 00/00/0000', function () {
    it('Open the export modal window', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      const exportDialog = await transactionsPage.openExportModalWindow();
      const exportDialogIsDisplayed = await exportDialog.isDisplayed();
      expect(exportDialogIsDisplayed, 'Something wrong with Export Transaction Dialog').to.be.true;
    });

    it('Set the date 00.00.0000 in both export fields', async function () {
      const exportDialog = new TransactionsSubTab(webdriver, logger).getExportDialog();
      // mm/dd/yyyy
      await exportDialog.setStartDate('00000000');
      // mm/dd/yyyy
      await exportDialog.setEndDate('00000000');
      await exportDialog.clickIncludeTxsIDs();
    });

    // Check the exported file
    it('Checking the export availability', async function () {
      const exportDialog = new TransactionsSubTab(webdriver, logger).getExportDialog();
      const btnEnabled = await exportDialog.exportButtonIsEnabled();
      expect(btnEnabled, 'The export button is enabled').to.be.false;
      if (isLinux() && isHeadless()) {
        console.warn('Color checks are skipped.');
      } else {
        const startInputColor = await exportDialog.getStartDateInputBorderColor();
        expect(startInputColor, 'Start date input is not higlighted').to.equal(Colors.errorRed);
        const endInputColor = await exportDialog.getEndDateInputBorderColor();
        expect(endInputColor, 'End date input is not higlighted').to.equal(Colors.errorRed);
      }
    });
  });
  describe('The end date is earlier then the start date', function () {
    it('Refresh page', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      await transactionsPage.refreshPage();
      const txPageIsDisplayed = await transactionsPage.isDisplayed();
      expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    });

    it('Open the export modal window', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      const exportDialog = await transactionsPage.openExportModalWindow();
      const exportDialogIsDisplayed = await exportDialog.isDisplayed();
      expect(exportDialogIsDisplayed, 'Something wrong with Export Transaction Dialog').to.be.true;
    });

    it('Set incorrect dates', async function () {
      const exportDialog = new TransactionsSubTab(webdriver, logger).getExportDialog();
      // mm/dd/yyyy - 11/13/2023, it is only for testWallet1
      await exportDialog.setStartDate('03082024');
      // mm/dd/yyyy - 03/08/2024, it is only for testWallet1
      await exportDialog.setEndDate('11132023');
      await exportDialog.clickIncludeTxsIDs();
    });

    // Check the exported file
    it('Checking the export availability', async function () {
      const exportDialog = new TransactionsSubTab(webdriver, logger).getExportDialog();
      const btnEnabled = await exportDialog.exportButtonIsEnabled();
      expect(btnEnabled, 'The export button is enabled').to.be.false;
      const endInputColor = await exportDialog.getEndDateInputBorderColor();
      expect(endInputColor, 'End date input is not higlighted').to.equal(Colors.errorRed);
    });
  });
  // 27 September 2017 (09272017) - cardano network initial release
  describe('Both fields has the same date in the past, Cardano did not exist', function () {
    it('Refresh page', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      await transactionsPage.refreshPage();
      const txPageIsDisplayed = await transactionsPage.isDisplayed();
      expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    });

    it('Open the export modal window', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      const exportDialog = await transactionsPage.openExportModalWindow();
      const exportDialogIsDisplayed = await exportDialog.isDisplayed();
      expect(exportDialogIsDisplayed, 'Something wrong with Export Transaction Dialog').to.be.true;
    });

    it('Set export dates', async function () {
      const exportDialog = new TransactionsSubTab(webdriver, logger).getExportDialog();
      await exportDialog.setStartDate('09252017');
      await exportDialog.setEndDate('09252017');
      await exportDialog.clickIncludeTxsIDs();
      const btnEnabled = await exportDialog.exportButtonIsEnabled();
      expect(btnEnabled, 'The export button is not enabled').to.be.true;
      await exportDialog.exportTransactionsFile();
    });
    it('Checking the export', async function () {
      // check file exists
      const allDownloadedFiles = getListOfDownloadedFiles();
      expect(allDownloadedFiles.length, 'Exported transactions file is downloaded').to.equal(0);
      const exportDialog = new TransactionsSubTab(webdriver, logger).getExportDialog();
      const errorMsg = await exportDialog.getErrorMessage();
      expect(errorMsg, 'Incorrect error message is displayed').to.equal('No transaction history.');
    });
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
