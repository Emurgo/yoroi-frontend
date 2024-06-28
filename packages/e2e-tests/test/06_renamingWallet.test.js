import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import { testWallet1 } from '../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger, walletNameShortener } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import WalletSubTab from '../pages/wallet/settingsTab/walletSubTab.page.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import AddNewWallet from '../pages/addNewWallet.page.js';

describe('Renaming the wallet', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  const newWalletName = 'newWalletName';

  before(function () {
    webdriver = driversPoolsManager.getDriverFromPool();
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

  it('Go to Wallet subtub in Settings', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.goToSettingsTab();
    const settingsPage = new SettingsTab(webdriver, logger);
    await settingsPage.goToWalletSubMenu();
  });

  it('Renaming wallet', async function () {
    const settingsWalletPage = new WalletSubTab(webdriver, logger);
    await settingsWalletPage.changeWalletName(newWalletName, testWallet1.name);
  });

  // Check the wallet name is changed
  it('Check changes', async function () {
    const settingsWalletPage = new WalletSubTab(webdriver, logger);
    const walletInfo = await settingsWalletPage.getSelectedWalletInfo();
    const shortedWalletName = walletNameShortener(newWalletName);
    expect(walletInfo.name, `The wallet name should be "${newWalletName}"`).to.equal(
      shortedWalletName
    );
    await settingsWalletPage.openChangeWalletModal();
    // there is 0 (zero) because we have only one added wallet
    const walletsListWalletInfo = await settingsWalletPage.getWalletInfoFromChangeWalletDialog(0);
    expect(
      walletsListWalletInfo.name,
      `Expected wallet name "${newWalletName}" in the wallet list`
    ).to.equal(newWalletName);
    expect(
      walletsListWalletInfo.balance,
      `Expected wallet balance "${testWallet1.balance}" in the wallet list`
    ).to.equal(testWallet1.balance);
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
