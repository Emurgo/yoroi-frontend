import { customAfterEach } from '../../../utils/customHooks.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet3 } from '../../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { restoreWallet } from '../../../helpers/restoreWalletHelper.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Show more txs', function () {
  this.timeout(5 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
  });

  it(`Restore a 15-word test wallet ${testWallet3.name}`, async function () {
    await restoreWallet(webdriver, logger, testWallet3);
  });

  it('Check amount of auto-loaded transactions', async function () {
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    const displayedTxsAmount = await transactionsPage.getAmountOfTxs();
    // max 20 txs are loaded automatically
    expect(displayedTxsAmount, 'Incorrect amount of txs is displayed').to.equal(20);
  });

  it('Load txs and check amount', async function () {
    await transactionsPage.loadMoreTxs(1);
    const displayedTxsAmount = await transactionsPage.getAmountOfTxs();
    expect(displayedTxsAmount, 'The amount of txs is different from expected').to.be.at.least(testWallet3.minTxs);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
