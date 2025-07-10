import BasePage from '../pages/basepage.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1 } from '../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { customAfterEach } from '../utils/customHooks.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import WalletSubTab from '../pages/wallet/settingsTab/walletSubTab.page.js';
import { getPassword } from '../helpers/constants.js';
import WalletTab from '../pages/wallet/walletTab/walletTab.page.js';
import SendSubTab from '../pages/wallet/walletTab/sendSubTab.page.js';
import { WRONG_PASSWORD_TX_REVIEW } from '../helpers/messages.js';
import driversPoolsManager from '../utils/driversPool.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import TxReviewOverviewTab from '../pages/transactionReviewPages/txReviewOverviewTab.page.js';
import TxReviewSubmit from '../pages/transactionReviewPages/txReviewSubmit.page.js';

describe('Changing wallet password. Positive', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1', this);
  });

  const oldPassword = getPassword();
  const newPassword = getPassword(10, true);

  it('Go to Settings Wallet', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    await transactionsPage.goToSettingsTab();
    const settingsPage = new SettingsTab(webdriver, logger);
    await settingsPage.goToWalletSubMenu();
  });
  it('Correct old password, correct new password', async function () {
    const walletSubTabPage = new WalletSubTab(webdriver, logger);
    await walletSubTabPage.changeWalletPassword(oldPassword, newPassword, newPassword);
  });
  it('Go to Send page', async function () {
    const walletSubTabPage = new WalletSubTab(webdriver, logger);
    await walletSubTabPage.goToWalletTab();
    const walletPage = new WalletTab(webdriver, logger);
    await walletPage.goToSendSubMenu();
  });
  it('Filling send info', async function () {
    const sendSubTab = new SendSubTab(webdriver, logger);
    await sendSubTab.enterReceiverAndMemo(testWallet1.receiveAddress);
    await sendSubTab.addAssets('1');
  });
  // Checking that the old password doesn't work anymore
  it("Checking the old wallet doesn't work anymore", async function () {
    const txReviewOverview = new TxReviewOverviewTab(webdriver, logger);
    await txReviewOverview.confirm();
    const txReviewSubmit = new TxReviewSubmit(webdriver, logger);
    await txReviewSubmit.enterPassword(oldPassword);
    await txReviewSubmit.submit();
    const errorMessage = await txReviewSubmit.getPasswordErrorMessage();
    expect(errorMessage, 'Wrong error message').to.equal(WRONG_PASSWORD_TX_REVIEW);
  });

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(function (done) {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
    done();
  });
});
