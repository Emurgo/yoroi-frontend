import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { diffIsLessPerc, getCurrenciesPrices, getTestLogger, roundUpCurrency } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';
import { preloadDBAndStorage, waitTxPage } from '../helpers/restoreWalletHelper.js';

describe('Changing fiat currencies', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let prices = {};

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await preloadDBAndStorage(webdriver, logger, 'testWallet1');
    await waitTxPage(webdriver, logger);
    prices = await getCurrenciesPrices();
  });

  const testData = ['BRL', 'ETH', 'BTC', 'KRW', 'CNY', 'EUR', 'JPY', 'USD', 'ADA'];

  for (const testDatum of testData) {
    describe(`Changing fiat currency to ${testDatum}`, function () {
      it('Open General settings', async function () {
        const transactionsPage = new TransactionsSubTab(webdriver, logger);
        await transactionsPage.goToSettingsTab();
        const settingsPage = new SettingsTab(webdriver, logger);
        await settingsPage.goToGeneralSubMenu();
      });

      it('Select currency', async function () {
        const generalSubTab = new GeneralSubTab(webdriver, logger);
        await generalSubTab.selectFiat(testDatum);
      });

      it(`Check the selected currency ${testDatum} is applied`, async function () {
        const generalSubTab = new GeneralSubTab(webdriver, logger);
        await generalSubTab.goToWalletTab();
        const walletInfo = await generalSubTab.getSelectedWalletInfo();
        if (testDatum === 'ADA') {
          expect(walletInfo.fiatBalance, 'Fiat balance is different').to.equal(0);
        } else {
          expect(walletInfo.fiatCurrency, 'Fiat currency is different').to.equal(testDatum);
          const expectedFiatValue = roundUpCurrency(
            prices[testDatum] * walletInfo.balance,
            testDatum
          );
          const percents = 2;
          const diffLess2Perc = diffIsLessPerc(walletInfo.fiatBalance, expectedFiatValue, percents);
          expect(diffLess2Perc, `Fiat difference is more than ${percents}%`).to.be.true;
        }
      });
    });
  }

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
