import { customAfterEach } from '../../../utils/customHooks.js';
import { testWallet1, testWallet2 } from '../../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { checkCorrectWalletIsDisplayed, restoreWallet, prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import SettingsTab from '../../../pages/wallet/settingsTab/settingsTab.page.js';
import WalletSubTab from '../../../pages/wallet/settingsTab/walletSubTab.page.js';
import WalletCommonBase from '../../../pages/walletCommonBase.page.js';
import AddNewWallet from '../../../pages/addNewWallet.page.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Removing the first wallet, two wallets is added', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {WalletCommonBase} */
  let walletCommonBasePage = null;
  /** @type {AddNewWallet} */
  let addNewWalletPage = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SettingsTab} */
  let settingsPage = null;
  /** @type {WalletSubTab} */
  let settingsWalletPage = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    walletCommonBasePage = new WalletCommonBase(webdriver, logger);
    addNewWalletPage = new AddNewWallet(webdriver, logger);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    settingsWalletPage = new WalletSubTab(webdriver, logger);
  });

  // restore the second wallet
  it('Restore the test wallet 2', async function () {
    await walletCommonBasePage.addNewWallet();
    const pageIsDisplayed = await addNewWalletPage.isDisplayed();
    expect(pageIsDisplayed, 'Adding a new wallet is not displayed').to.be.true;
    await restoreWallet(webdriver, logger, testWallet2, false, false);
  });

  // switch back to first wallet
  it('Switch back to the test wallet 1', async function () {
    await walletCommonBasePage.switchToFirstWallet();
    await checkCorrectWalletIsDisplayed(webdriver, logger, testWallet1);
  });

  it('Remove wallet', async function () {
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    await transactionsPage.goToSettingsTab();
    await settingsPage.goToWalletSubMenu();
    await settingsWalletPage.removeWallet();
  });

  // check that we are returned to the second wallet
  it('Checking the app state after removing the wallet', async function () {
    await checkCorrectWalletIsDisplayed(webdriver, logger, testWallet2);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletCommonBasePage.closeBrowser();
  });
});
