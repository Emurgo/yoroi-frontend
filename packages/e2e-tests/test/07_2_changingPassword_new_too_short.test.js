import BasePage from '../pages/basepage.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import WalletSubTab from '../pages/wallet/settingsTab/walletSubTab.page.js';
import { getPassword } from '../helpers/constants.js';
import { PASSWORD_TOO_SHORT } from '../helpers/messages.js';
import driversPoolsManager from '../utils/driversPool.js';
import { collectInfo, preloadDBAndStorage, waitTxPage } from '../helpers/restoreWalletHelper.js';

describe('Changing wallet password. Negative. New one is short', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  const oldPassword = getPassword();

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    try {
      webdriver = await driversPoolsManager.getDriverFromPool();
      await preloadDBAndStorage(webdriver, logger, 'testWallet1');
      await waitTxPage(webdriver, logger);
    } catch (error) {
      await collectInfo(this, webdriver, logger);
      throw error;
    }
  });

  it('Go to Settings -> Wallet', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    await transactionsPage.goToSettingsTab();
    const settingsPage = new SettingsTab(webdriver, logger);
    await settingsPage.goToWalletSubMenu();
  });
  it('Changing password, correct old one, new one is too short', async function () {
    const walletSubTabPage = new WalletSubTab(webdriver, logger);
    await walletSubTabPage.changeWalletPassword(oldPassword, 'a', oldPassword, true, true);
  });
  it('Checking the error message', async function () {
    const walletSubTabPage = new WalletSubTab(webdriver, logger);
    const errIsShown = await walletSubTabPage.newPasswordErrDisplayedAndNotEmpty();
    expect(errIsShown, 'The error is not displayed').to.be.true;
    const realErrMsg = await walletSubTabPage.getNewPasswordErrorMsg();
    expect(realErrMsg, 'Incorrect error is shown').to.equal(PASSWORD_TOO_SHORT);
  });

  after(function (done) {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
    done();
  });
});
