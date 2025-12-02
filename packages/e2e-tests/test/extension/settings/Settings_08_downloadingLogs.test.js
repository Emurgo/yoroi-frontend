import { customAfterEach } from '../../../utils/customHooks.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { cleanDownloads, getDownloadedFileContent, getListOfDownloadedFiles, getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import SettingsTab from '../../../pages/wallet/settingsTab/settingsTab.page.js';
import SupportSubTab from '../../../pages/wallet/settingsTab/supportSubTab.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Downloading logs for support', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SettingsTab} */
  let settingsPage = null;
  /** @type {SupportSubTab} */
  let supportSubTab = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    cleanDownloads();
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    supportSubTab = new SupportSubTab(webdriver, logger);
  });

  it('Go to Settings Support', async function () {
    await transactionsPage.goToSettingsTab();
    await settingsPage.goToSupportSubMenu();
  });

  // Click Download logs
  it('Download logs for support', async function () {
    await supportSubTab.downloadLogs();
  });

  // Check the downloaded file
  it('Checking the downloaded file', async function () {
    // check file exists
    const allDownloadedFiles = getListOfDownloadedFiles();
    expect(allDownloadedFiles.length).to.equal(1);
    // check file name
    const fileName = allDownloadedFiles[0];
    expect(fileName).to.match(/\d{4}(-\d{2}){2}T\d{2}(-\d{2}){2}-yoroi-logs\.zip/gi);
    // check downloaded file is not empty
    const fileContent = await getDownloadedFileContent(fileName);
    expect(Object.keys(fileContent).length, 'Support log archive contains no files').to.be.greaterThan(0);
    for (const key in fileContent) {
      const content = fileContent[key];
      expect(content, `Support log file "${key}" is empty`).to.not.be.empty;
    }
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
