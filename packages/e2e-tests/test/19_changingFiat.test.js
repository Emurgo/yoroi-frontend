import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { diffIsLess1Perc, getCurrenciesPrices, getTestLogger, roundUpCurrency } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';
import AddNewWallet from '../pages/addNewWallet.page.js';

describe('Changing fiat currencies', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let prices = {};

  before(function (done) {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    done();
  });

  const testData = ['BRL', 'ETH', 'BTC', 'KRW', 'CNY', 'EUR', 'JPY', 'USD', 'ADA'];

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
    prices = await getCurrenciesPrices();
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
          const diffLess1Perc = diffIsLess1Perc(walletInfo.fiatBalance, expectedFiatValue);
          expect(diffLess1Perc, 'Fiat difference is more than 1%').to.be.true;
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
