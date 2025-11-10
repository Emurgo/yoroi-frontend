import { customAfterEach } from '../../../utils/customHooks.js';
import { testWallet1 } from '../../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger, walletNameShortener } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import SettingsTab from '../../../pages/wallet/settingsTab/settingsTab.page.js';
import WalletSubTab from '../../../pages/wallet/settingsTab/walletSubTab.page.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Renaming the wallet', function () {
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
  const newWalletName = 'newWalletName';
  let oldWalletName = '';

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    settingsWalletPage = new WalletSubTab(webdriver, logger);
  });

  it('Go to Wallet subtab in Settings', async function () {
    await transactionsPage.goToSettingsTab();
    await settingsPage.goToWalletSubMenu();
  });

  it('Renaming wallet', async function () {
    const walletInfo = await settingsWalletPage.getSelectedWalletInfo();
    oldWalletName = walletInfo.name;
    await settingsWalletPage.changeWalletName(newWalletName, testWallet1.name);
  });

  // Check the wallet name is changed
  it('Check changes', async function () {
    const nameIsChanged = await settingsWalletPage.walletNameIsChanged(oldWalletName);
    expect(nameIsChanged, 'The wallet name is not changed').to.be.true;
    const walletInfo = await settingsWalletPage.getSelectedWalletInfo();
    const shortedWalletName = walletNameShortener(newWalletName);
    expect(walletInfo.name, `The wallet name should be "${newWalletName}"`).to.equal(shortedWalletName);
    await settingsWalletPage.openChangeWalletModal();
    // there is 0 (zero) because we have only one added wallet
    const walletsListWalletInfo = await settingsWalletPage.getWalletInfoFromChangeWalletDialog(0);
    expect(walletsListWalletInfo.name, `Expected wallet name "${newWalletName}" in the wallet list`).to.equal(newWalletName);
    expect(walletsListWalletInfo.balance, `Expected wallet balance "${testWallet1.balance}" in the wallet list`).to.equal(
      testWallet1.balance
    );
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
