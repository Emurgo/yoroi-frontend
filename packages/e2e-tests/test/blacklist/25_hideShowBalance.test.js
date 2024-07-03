import BasePage from '../../pages/basepage.js';
import { customAfterEach } from '../../utils/customHooks.js';
import TransactionsSubTab from '../../pages/wallet/walletTab/walletTransactions.page.js';
import ReceiveSubTab from '../../pages/wallet/walletTab/receiveSubTab.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import driversPoolsManager from '../../utils/driversPool.js';
import { preloadDBAndStorage, waitTxPage } from '../../helpers/restoreWalletHelper.js';
import { testWallet1 } from '../../utils/testWallets.js';

// Issue https://emurgo.atlassian.net/browse/YOEXT-1218
describe('Hide and show balance', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await preloadDBAndStorage(webdriver, logger, 'testWallet1MemoAdded');
    await waitTxPage(webdriver, logger);
  });
  // check the default state. The balance should be displayed
  it('Check default state', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const walletInfo = await transactionsPage.getSelectedWalletInfo();
    expect(walletInfo.balance, 'The wallet balance is different').to.equal(testWallet1.balance);
    expect(walletInfo.name, `The wallet name is incorrect`).to.equal(testWallet1.name);
    expect(walletInfo.plate, `The wallet plate is incorrect`).to.equal(testWallet1.plate);
  });
  // click hide balance
  it('Hide balance', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.showHideBalance();
  });
  it('Check balance is hidden on the top bar wallet info', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const balanceIsHidden = await transactionsPage.balanceIsHiddenOnTopPanel();
    expect(balanceIsHidden, 'Balance is not hidden').to.be.true;
  });
  it('Check balance is hidden in collapsed txs', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const collapsedTxsBalanceHidden = await transactionsPage.balanceIsHiddenInCollapsedTxs();
    expect(collapsedTxsBalanceHidden, 'Balance is not hidden in collapsed txs').to.be.true;
  });
  // check balance in an expanded tx
  it('Check balance is hidden in expanded txs', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const expandedTxsBalanceHidden = await transactionsPage.balanceIsHiddenInExpandedTxs();
    expect(expandedTxsBalanceHidden, 'Balance is not hidden in expanded txs').to.be.true;
  });
  // check balance on Receive tab
  it('Check balances are hidden on Receive page', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.goToReceiveSubMenu();
    const receivePage = new ReceiveSubTab(webdriver, logger);
    await receivePage.selectBaseExtHasBalanceAddrs();
    const balanceExtAddrHidden = await receivePage.allAddressesBalancesHidden();
    expect(balanceExtAddrHidden, 'Balances of external addresses are not hidden').to.be.true;
    await receivePage.selectBaseInterHasBalanceAddrs();
    const balanceInterAddrHidden = await receivePage.allAddressesBalancesHidden();
    expect(balanceInterAddrHidden, 'Balances of internal addresses are not hidden').to.be.true;
  });
  // add checking Staking page when testnetwork is added
  // click show balance
  it('Show balance', async function () {
    const receivePage = new ReceiveSubTab(webdriver, logger);
    await receivePage.goToWalletTab();
    await receivePage.goToTransactionsSubMenu();
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.showHideBalance();
  });
  // check balance on the the top bar wallet info panel
  it('Check balance is shown on the top bar wallet info', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const balanceIsHidden = await transactionsPage.balanceIsHiddenOnTopPanel();
    expect(balanceIsHidden, 'Balance is hidden').to.be.false;
  });
  // check balance in a collapsed tx
  it('Check balance is shown in collapsed txs', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const collapsedTxsBalanceHidden = await transactionsPage.balanceIsHiddenInCollapsedTxs();
    expect(collapsedTxsBalanceHidden, 'Balance is hidden in collapsed txs').to.be.false;
  });
  // check balance in an expanded tx
  it('Check balance is shown in expanded txs', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const expandedTxsBalanceHidden = await transactionsPage.balanceIsHiddenInExpandedTxs();
    expect(expandedTxsBalanceHidden, 'Balance is hidden in expanded txs').to.be.false;
  });
  // check balance on Receive tab
  it('Check balances are shown on Receive page', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.goToReceiveSubMenu();
    const receivePage = new ReceiveSubTab(webdriver, logger);
    await receivePage.selectBaseExtHasBalanceAddrs();
    const balanceExtAddrHidden = await receivePage.allAddressesBalancesHidden();
    expect(balanceExtAddrHidden, 'Balances of external addresses are hidden').to.be.false;
    await receivePage.selectBaseInterHasBalanceAddrs();
    const balanceInterAddrHidden = await receivePage.allAddressesBalancesHidden();
    expect(balanceInterAddrHidden, 'Balances of internal addresses are hidden').to.be.false;
  });
  // add checking Staking page when testnetwork is added

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
