import { expect } from 'chai';
import BasePage from '../../pages/basepage.js';
import driversPoolsManager from '../../utils/driversPool.js';
import TransactionsSubTab from '../../pages/wallet/walletTab/walletTransactions.page.js';
import { customAfterEach } from '../../utils/customHooks.js';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { restoreWallet } from '../../helpers/restoreWalletHelper.js';
import { getSpendableWallet } from '../../utils/testWallets.js';
import ReceiveSubTab from '../../pages/wallet/walletTab/receiveSubTab.page.js';

// The test case is based on the issue https://emurgo.atlassian.net/browse/YOEXT-965
describe('Comparing balances on the top plate and on addresses', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let topPlateBalance = 0;
  let balanceOnAddrs = 0;

  before(function () {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
  });

  it('Restore a 15-word wallet', async function () {
    const testWallet = getSpendableWallet();
    await restoreWallet(webdriver, logger, testWallet);
  });

  it('Get wallet balance', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    const walletInfo = await transactionsPage.getSelectedWalletInfo();
    topPlateBalance = walletInfo.balance;
  });

  it('Get wallet balance from receive addresses', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.goToReceiveSubMenu();
    const receivePage = new ReceiveSubTab(webdriver, logger);
    await receivePage.selectBaseExtHasBalanceAddrs();
    const balanceExtAddr = await receivePage.getBalanceOfDisplayedAddrs();
    await receivePage.selectBaseInterHasBalanceAddrs();
    const balanceInterAddr = await receivePage.getBalanceOfDisplayedAddrs();
    balanceOnAddrs = balanceExtAddr + balanceInterAddr;
  });

  it('Compare balances', async function () {
    expect(topPlateBalance).to.equal(balanceOnAddrs);
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
