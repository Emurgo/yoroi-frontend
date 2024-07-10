import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import WalletSubTab from '../pages/wallet/settingsTab/walletSubTab.page.js';
import AddNewWallet from '../pages/addNewWallet.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import { preloadDBAndStorage, waitTxPage } from '../helpers/restoreWalletHelper.js';

describe('Removing a wallet, one wallet is added', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await preloadDBAndStorage(webdriver, logger, 'testWallet1');
    await waitTxPage(webdriver, logger);
  });

  it('Remove wallet', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.goToSettingsTab();
    const settingsPage = new SettingsTab(webdriver, logger);
    await settingsPage.goToWalletSubMenu();
    const settingsWalletPage = new WalletSubTab(webdriver, logger);
    await settingsWalletPage.removeWallet();
  });

  it('Checking the app state after removing the wallet', async function () {
    const addNewWalletPage = new AddNewWallet(webdriver, logger);
    const pageIsDisplayed = await addNewWalletPage.isDisplayed();
    expect(pageIsDisplayed, 'Something went during removing a wallet').to.be.true;
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
