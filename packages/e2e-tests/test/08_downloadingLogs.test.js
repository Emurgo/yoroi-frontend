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
} from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { restoreWallet } from '../helpers/restoreWalletHelper.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import SupportSubTab from '../pages/wallet/settingsTab/supportSubTab.page.js';
import driversPoolsManager from '../utils/driversPool.js';

describe('Downloading logs for support', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(function (done) {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    cleanDownloads();
    done();
  });

  it('Restore a 15-word wallet', async function () {
    await restoreWallet(webdriver, logger, testWallet1);
  });

  it('Go to Settings -> Support', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    await transactionsPage.goToSettingsTab();
    const settingsPage = new SettingsTab(webdriver, logger);
    await settingsPage.goToSupportSubMenu();
  });

  // Click Download logs
  it('Download logs for support', async function () {
    const supportSubTab = new SupportSubTab(webdriver, logger);
    await supportSubTab.downloadLogs();
  });

  // Check the downloaded file
  it('Checking the downloaded file', async function () {
    // check file exists
    const allDownloadedFiles = getListOfDownloadedFiles();
    expect(allDownloadedFiles.length).to.equal(1);
    // check file name
    const fileName = allDownloadedFiles[0];
    expect(fileName).to.match(/(\d+.)+\d+T(\d+.)+\d+\+\d+.\d+-yoroi\.log/gi);
    // check downloaded file is not empty
    const fileContent = getDownloadedFileContent(fileName);
    expect(fileContent, 'Support log file is empty').to.not.be.empty;
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
