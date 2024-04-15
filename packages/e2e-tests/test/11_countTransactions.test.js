import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1, testWallet2 } from '../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { restoreWallet } from '../helpers/restoreWalletHelper.js';
import driversPoolsManager from '../utils/driversPool.js';

const testData = [
  {
    testWallet: testWallet1,
    expectedTxsAmount: 2,
  },
  {
    testWallet: testWallet2,
    expectedTxsAmount: 6,
  },
];

for (const testDatum of testData) {
  describe('Checking amount of txs', function () {
    this.timeout(2 * oneMinute);
    let webdriver = null;
    let logger = null;

    before(function (done) {
      webdriver = driversPoolsManager.getDriverFromPool();
      logger = getTestLogger(this.test.parent.title);
      done();
    });

    it(`Restore a 15-word test wallet ${testDatum.testWallet.name}`, async function () {
      await restoreWallet(webdriver, logger, testDatum.testWallet);
    });

    // count displayed txs
    it('Check amount of transactions', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      const txPageIsDisplayed = await transactionsPage.isDisplayed();
      expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
      const displayedTxsAmount = await transactionsPage.getAmountOfTxs();
      expect(displayedTxsAmount, 'Incorrect amount of txs is displayed').to.equal(
        testDatum.expectedTxsAmount
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
}
