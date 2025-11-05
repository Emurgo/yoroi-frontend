import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1 } from '../../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import SettingsTab from '../../../pages/wallet/settingsTab/settingsTab.page.js';
import WalletSubTab from '../../../pages/wallet/settingsTab/walletSubTab.page.js';
import { getPassword } from '../../../helpers/constants.js';
import WalletTab from '../../../pages/wallet/walletTab/walletTab.page.js';
import SendSubTab from '../../../pages/wallet/walletTab/sendSubTab.page.js';
import { WRONG_PASSWORD_TX_REVIEW } from '../../../helpers/messages.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import TxReviewOverviewTab from '../../../pages/transactionReviewPages/txReviewOverviewTab.page.js';
import TxReviewSubmit from '../../../pages/transactionReviewPages/txReviewSubmit.page.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Changing wallet password. Positive', function () {
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
  /** @type {WalletTab} */
  let walletPage = null;
  /** @type {SendSubTab} */
  let sendSubTab = null;
  /** @type {TxReviewOverviewTab} */
  let txReviewOverview = null;
  /** @type {TxReviewSubmit} */
  let txReviewSubmit = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    settingsWalletPage = new WalletSubTab(webdriver, logger);
    walletPage = new WalletTab(webdriver, logger);
    sendSubTab = new SendSubTab(webdriver, logger);
    txReviewOverview = new TxReviewOverviewTab(webdriver, logger);
    txReviewSubmit = new TxReviewSubmit(webdriver, logger);
  });

  const oldPassword = getPassword();
  const newPassword = getPassword(10, true);

  it('Go to Settings Wallet', async function () {
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    await transactionsPage.goToSettingsTab();
    await settingsPage.goToWalletSubMenu();
  });
  it('Correct old password, correct new password', async function () {
    await settingsWalletPage.changeWalletPassword(oldPassword, newPassword, newPassword);
  });
  it('Go to Send page', async function () {
    await settingsWalletPage.goToWalletTab();
    await walletPage.goToSendSubMenu();
  });
  it('Filling send info', async function () {
    await sendSubTab.enterReceiverAndMemo(testWallet1.receiveAddress);
    await sendSubTab.addAssets('1');
  });
  // Checking that the old password doesn't work anymore
  it("Checking the old wallet doesn't work anymore", async function () {
    await txReviewOverview.confirm();
    await txReviewSubmit.enterPassword(oldPassword);
    await txReviewSubmit.submit();
    const errorMessage = await txReviewSubmit.getPasswordErrorMessage();
    expect(errorMessage, 'Wrong error message').to.equal(WRONG_PASSWORD_TX_REVIEW);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletPage.closeBrowser();
  });
});
