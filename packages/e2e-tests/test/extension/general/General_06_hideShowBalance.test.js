import { customAfterEach } from '../../../utils/customHooks.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import ReceiveSubTab from '../../../pages/wallet/walletTab/receiveSubTab.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { testWallet1 } from '../../../utils/testWallets.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Hide and show balance', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {ReceiveSubTab} */
  let receivePage = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    receivePage = new ReceiveSubTab(webdriver, logger);
  });
  // check the default state. The balance should be displayed
  it('Check default state', async function () {
    const walletInfo = await transactionsPage.getSelectedWalletInfo();
    expect(walletInfo.balance, 'The wallet balance is different').to.equal(testWallet1.balance);
    expect(walletInfo.name, `The wallet name is incorrect`).to.equal(testWallet1.name);
    expect(walletInfo.plate, `The wallet plate is incorrect`).to.equal(testWallet1.plate);
  });
  // click hide balance
  it('Hide balance', async function () {
    await transactionsPage.showHideBalance();
  });
  it('Check balance is hidden on the top bar wallet info', async function () {
    const balanceIsHidden = await transactionsPage.balanceIsHiddenOnTopPanel();
    expect(balanceIsHidden, 'Balance is not hidden').to.be.true;
  });
  it('Check balance is hidden in collapsed txs', async function () {
    const collapsedTxsBalanceHidden = await transactionsPage.balanceIsHiddenInCollapsedTxs();
    expect(collapsedTxsBalanceHidden, 'Balance is not hidden in collapsed txs').to.be.true;
  });
  // check balance in an expanded tx
  it('Check balance is hidden in expanded txs', async function () {
    const expandedTxsBalanceHidden = await transactionsPage.balanceIsHiddenInExpandedTxs();
    expect(expandedTxsBalanceHidden, 'Balance is not hidden in expanded txs').to.be.true;
  });
  // check balance on Receive tab
  it('Check balances are hidden on Receive page', async function () {
    await transactionsPage.goToReceiveSubMenu();
    await receivePage.selectBaseExtHasBalanceAddrs();
    const balanceExtAddrHidden = await receivePage.allAddressesBalancesHidden();
    expect(balanceExtAddrHidden, 'Balances of external addresses are not hidden').to.be.true;
  });
  // add checking Staking page when testnetwork is added
  // click show balance
  it('Show balance', async function () {
    await receivePage.goToWalletTab();
    await receivePage.goToTransactionsSubMenu();
    await transactionsPage.showHideBalance();
  });
  // check balance on the the top bar wallet info panel
  it('Check balance is shown on the top bar wallet info', async function () {
    const balanceIsHidden = await transactionsPage.balanceIsHiddenOnTopPanel();
    expect(balanceIsHidden, 'Balance is hidden').to.be.false;
  });
  // check balance in a collapsed tx
  it('Check balance is shown in collapsed txs', async function () {
    const collapsedTxsBalanceHidden = await transactionsPage.balanceIsHiddenInCollapsedTxs();
    expect(collapsedTxsBalanceHidden, 'Balance is hidden in collapsed txs').to.be.false;
  });
  // check balance in an expanded tx
  it('Check balance is shown in expanded txs', async function () {
    const expandedTxsBalanceHidden = await transactionsPage.balanceIsHiddenInExpandedTxs();
    expect(expandedTxsBalanceHidden, 'Balance is hidden in expanded txs').to.be.false;
  });
  // check balance on Receive tab
  it('Check balances are shown on Receive page', async function () {
    await transactionsPage.goToReceiveSubMenu();
    await receivePage.selectBaseExtHasBalanceAddrs();
    const balanceExtAddrHidden = await receivePage.allAddressesBalancesHidden();
    expect(balanceExtAddrHidden, 'Balances of external addresses are hidden').to.be.false;
  });
  // add checking Staking page when testnetwork is added

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
