import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1 } from '../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger, roundUpCurrency } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { restoreWallet } from '../helpers/restoreWalletHelper.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';
import axios from 'axios';

describe('Changing fiat currencies', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(function (done) {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    done();
  });

  const testData = ['BRL', 'ETH', 'BTC', 'KRW', 'CNY', 'EUR', 'JPY', 'USD', 'ADA'];

  it('Restore a 15-word wallet', async function () {
    await restoreWallet(webdriver, logger, testWallet1);
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
  });

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

      it('Check the selected currency is applied', async function () {
        const generalSubTab = new GeneralSubTab(webdriver, logger);
        await generalSubTab.goToWalletTab();
        const walletInfo = await generalSubTab.getSelectedWalletInfo();
        if (testDatum === 'ADA') {
          expect(walletInfo.fiatBalance, 'Fiat balance is different').to.equal(0);
        } else {
          expect(walletInfo.fiatCurrency, 'Fiat currency is different').to.equal(testDatum);
          const reqResponse = await axios.get('https://iohk-mainnet.yoroiwallet.com/api/price/ADA/current');
          const prices = reqResponse.data.ticker.prices;
          const expectedFiatValue = roundUpCurrency(
            prices[testDatum] * walletInfo.balance,
            testDatum
          );
          expect(walletInfo.fiatBalance, 'Fiat balance is different').to.equal(expectedFiatValue);
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
