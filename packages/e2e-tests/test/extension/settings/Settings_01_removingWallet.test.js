import { customAfterEach } from '../../../utils/customHooks.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import SettingsTab from '../../../pages/wallet/settingsTab/settingsTab.page.js';
import WalletSubTab from '../../../pages/wallet/settingsTab/walletSubTab.page.js';
import AddNewWallet from '../../../pages/addNewWallet.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Removing a wallet, one wallet is added', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SettingsTab} */
  let settingsPage = null;
  /** @type {WalletSubTab} */
  let settingsWalletPage = null;
  /** @type {AddNewWallet} */
  let addNewWalletPage = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    settingsWalletPage = new WalletSubTab(webdriver, logger);
    addNewWalletPage = new AddNewWallet(webdriver, logger);
  });

  it('Remove wallet', async function () {
    await transactionsPage.goToSettingsTab();
    await settingsPage.goToWalletSubMenu();
    await settingsWalletPage.removeWallet();
  });

  it('Checking the app state after removing the wallet', async function () {
    const pageIsDisplayed = await addNewWalletPage.isDisplayed();
    expect(pageIsDisplayed, 'Something went during removing a wallet').to.be.true;
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
