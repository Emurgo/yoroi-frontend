import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import { testWallet1, testWallet2 } from '../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { checkCorrectWalletIsDisplayed, restoreWallet } from '../helpers/restoreWalletHelper.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import WalletSubTab from '../pages/wallet/settingsTab/walletSubTab.page.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import AddNewWallet from '../pages/addNewWallet.page.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import driversPoolsManager from '../utils/driversPool.js';

describe('Removing the first wallet, two wallets is added', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
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

  // restore the second wallet
  it('Restore the test wallet 2', async function () {
    const walletCommonBasePage = new WalletCommonBase(webdriver, logger);
    await walletCommonBasePage.addNewWallet();
    const addNewWalletPage = new AddNewWallet(webdriver, logger);
    const pageIsDisplayed = await addNewWalletPage.isDisplayed();
    expect(pageIsDisplayed, 'Adding a new wallet is not displayed').to.be.true;
    await restoreWallet(webdriver, logger, testWallet2, false);
  });

  // switch back to first wallet
  it('Switch back to the test wallet 1', async function () {
    const walletCommonBasePage = new WalletCommonBase(webdriver, logger);
    await walletCommonBasePage.switchToFirstWallet();
    checkCorrectWalletIsDisplayed(webdriver, logger, testWallet1, false);
  });

  it('Remove wallet', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    await transactionsPage.goToSettingsTab();
    const settingsPage = new SettingsTab(webdriver, logger);
    await settingsPage.goToWalletSubMenu();
    const settingsWalletPage = new WalletSubTab(webdriver, logger);
    await settingsWalletPage.removeWallet();
  });

  // check that we are returned to the second wallet
  it('Checking the app state after removing the wallet', async function () {
    await checkCorrectWalletIsDisplayed(webdriver, logger, testWallet2, false);
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
