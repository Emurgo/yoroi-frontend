import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1 } from '../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import WalletSubTab from '../pages/wallet/settingsTab/walletSubTab.page.js';
import { getPassword } from '../helpers/constants.js';
import WalletTab from '../pages/wallet/walletTab/walletTab.page.js';
import SendSubTab from '../pages/wallet/walletTab/sendSubTab.page.js';
import { PASSWORDS_DONT_MATCH, PASSWORD_TOO_SHORT, WRONG_PASSWORD } from '../helpers/messages.js';
import driversPoolsManager from '../utils/driversPool.js';
import AddNewWallet from '../pages/addNewWallet.page.js';

describe('Changing wallet password', function () {
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
  });

  const oldPassword = getPassword();
  const newPassword = getPassword(10, true);
  // Cases
  // Correct old password, correct new password
  describe('Changing password, positive', function () {
    it('Go to Settings -> Wallet', async function () {
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
      await sendSubTab.addAssets(1);
      await sendSubTab.confirmTransaction(oldPassword);
    });
    // Checking that the old password doesn't work anymore
    it("Checking the old wallet doesn't work anymore", async function () {
      const sendSubTab = new SendSubTab(webdriver, logger);
      const realErrMsg = await sendSubTab.getPasswordErrorMsg();
      expect(realErrMsg, 'The old password still works').to.equal(WRONG_PASSWORD);
    });
  });
  // Incorrect old password, correct new password
  describe('Changing password, negative, incorrect old password', function () {
    it('Refresh page', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      await transactionsPage.refreshPage();
    });
    it('Go to Settings -> Wallet', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      const txPageIsDisplayed = await transactionsPage.isDisplayed();
      expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
      await transactionsPage.goToSettingsTab();
      const settingsPage = new SettingsTab(webdriver, logger);
      await settingsPage.goToWalletSubMenu();
    });
    it('Changing password, incorrect old one, correct new one', async function () {
      const walletSubTabPage = new WalletSubTab(webdriver, logger);
      await walletSubTabPage.changeWalletPassword(
        oldPassword,
        newPassword,
        newPassword,
        true,
        true
      );
    });
    it('Checking the error message', async function () {
      const walletSubTabPage = new WalletSubTab(webdriver, logger);
      const realErrMsg = await walletSubTabPage.getPasswordErrorMsg();
      expect(realErrMsg, 'The incorrect password is accepted').to.equal(WRONG_PASSWORD);
    });
  });
  // Correct old password, new too short
  describe('Changing password, negative, new password too short', function () {
    it('Refresh page', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      await transactionsPage.refreshPage();
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
      await walletSubTabPage.changeWalletPassword(newPassword, 'a', newPassword, true, true);
    });
    it('Checking the error message', async function () {
      const walletSubTabPage = new WalletSubTab(webdriver, logger);
      const realErrMsg = await walletSubTabPage.getNewPasswordErrorMsg();
      expect(realErrMsg, 'Incorrect error is shown').to.equal(PASSWORD_TOO_SHORT);
    });
  });
  // Correct old password, new and repeated passwords do not match
  describe('Changing password, negative, new passwords do not match', function () {
    const newPass1 = getPassword(10);
    const newPass2 = getPassword(10);
    it('Refresh page', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      await transactionsPage.refreshPage();
    });
    it('Go to Settings -> Wallet', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      const txPageIsDisplayed = await transactionsPage.isDisplayed();
      expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
      await transactionsPage.goToSettingsTab();
      const settingsPage = new SettingsTab(webdriver, logger);
      await settingsPage.goToWalletSubMenu();
    });
    it('Changing password, correct old one, new passwords dont match', async function () {
      const walletSubTabPage = new WalletSubTab(webdriver, logger);
      await walletSubTabPage.changeWalletPassword(newPassword, newPass1, newPass2, true, true);
    });
    it('Checking the error message', async function () {
      const walletSubTabPage = new WalletSubTab(webdriver, logger);
      const realErrMsg = await walletSubTabPage.getRepeatNewPasswordErrorMsg();
      expect(realErrMsg, 'Incorrect error is shown').to.equal(PASSWORDS_DONT_MATCH);
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
