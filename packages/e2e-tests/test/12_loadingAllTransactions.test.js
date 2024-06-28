import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { getSpendableWallet } from '../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { restoreWallet } from '../helpers/restoreWalletHelper.js';
import driversPoolsManager from '../utils/driversPool.js';

const testWallet = getSpendableWallet();

describe('Show more txs 5 times', function () {
  this.timeout(5 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(function () {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
  });

  it(`Restore a 15-word test wallet ${testWallet.name}`, async function () {
    await restoreWallet(webdriver, logger, testWallet);
  });

  it('Check amount of auto-loaded transactions', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    const displayedTxsAmount = await transactionsPage.getAmountOfTxs();
    // max 20 txs are loaded automatically
    expect(displayedTxsAmount, 'Incorrect amount of txs is displayed').to.equal(20);
  });

  it('Load txs and check amount', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.loadMoreTxs(5);
    const displayedTxsAmount = await transactionsPage.getAmountOfTxs();
    expect(displayedTxsAmount, 'The amount of txs is different from expected').to.be.at.least(
      testWallet.minTxs
    );
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
