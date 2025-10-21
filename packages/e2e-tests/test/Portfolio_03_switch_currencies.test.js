import { customAfterEach } from '../utils/customHooks.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import driversPoolsManager from '../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import BasePage from '../pages/basepage.js';
import PortfolioTab from '../pages/wallet/portfolio/porfolioMain.page.js';
import PortfolioTokenDetails from '../pages/wallet/portfolio/portfolioDetails.page.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';
import { Columns } from '../helpers/portfolioHelper.js';

describe('Portfolio switching currencies', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SettingsTab} */
  let settingsPage = null;
  /** @type {GeneralSubTab} */
  let generalSubTab = null;
  /** @type {PortfolioTab} */
  let portfolioMainPage = null;
  /** @type {PortfolioTokenDetails} */
  let detailsPage = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    generalSubTab = new GeneralSubTab(webdriver, logger);
    portfolioMainPage = new PortfolioTab(webdriver, logger);
    detailsPage = new PortfolioTokenDetails(webdriver, logger);
  });

  const testData = ['BRL', 'ETH', 'BTC', 'KRW', 'CNY', 'EUR', 'JPY', 'USD'];

  for (const testDatum of testData) {
    describe(`Change currency to ${testDatum}`, function () {
      it(`${testDatum} Open General settings`, async function () {
        await transactionsPage.goToSettingsTab();
        await settingsPage.goToGeneralSubMenu();
      });

      it(`Select currency ${testDatum}`, async function () {
        await generalSubTab.selectFiat(testDatum);
      });

      it(`${testDatum} Open Portfolio page`, async function () {
        await generalSubTab.goToPortfolioTab();
        const pageIsDisplayed = await portfolioMainPage.isDisplayed();
        expect(pageIsDisplayed, 'Portfolio page is not displayed').to.be.true;
        const isLoaded = await portfolioMainPage.waitIsLoaded();
        expect(isLoaded, 'Portfolio page is not loaded').to.be.true;
      });

      it(`${testDatum} Switch to second currency`, async function () {
        const pageIsLoaded = await portfolioMainPage.waitIsLoaded();
        expect(pageIsLoaded, 'Portfolio is not loaded').to.be.true;
        const pricesAreLoaded = await portfolioMainPage.waitPriceIsLoaded();
        expect(pricesAreLoaded, 'Tokens prices are not loaded').to.be.true;
        const balanceBeforeSwitch = await portfolioMainPage.getPortfolioBalance();
        await portfolioMainPage.switchCurrencies();
        const balanceAfterSwitch = await portfolioMainPage.getPortfolioBalance();
        expect(balanceAfterSwitch.main.value, 'Balance is different after switching').to.be.equal(
          balanceBeforeSwitch.secondary.value
        );
        expect(balanceAfterSwitch.main.fiat, 'Fiat is different after switching').to.be.equal(balanceBeforeSwitch.secondary.fiat);
        expect(balanceAfterSwitch.secondary.value, 'ADA balance is different after switching').to.be.equal(
          balanceBeforeSwitch.main.value
        );
        expect(balanceAfterSwitch.secondary.fiat, 'Token is not ada after switching').to.be.equal(balanceBeforeSwitch.main.fiat);
      });

      it(`${testDatum} Check fiat in price column`, async function () {
        const tokensPrices = await portfolioMainPage.getColumnValues(Columns.Price);
        for (const tokenPrice of tokensPrices) {
          if (tokenPrice.value) {
            expect(tokenPrice.fiat, 'Different fiat is in the token price').to.be.equal(testDatum);
          }
        }
      });

      it(`${testDatum} Check fiat in total column`, async function () {
        const totalValues = await portfolioMainPage.getColumnValues(Columns.Total);
        for (const totalValue of totalValues) {
          expect(totalValue.currency.fiat, 'Different fiat is in the total column').to.be.equal(testDatum);
        }
      });

      it(`${testDatum} Check info on token details`, async function () {
        await portfolioMainPage.switchCurrencies();
        const balanceMainPage = await portfolioMainPage.getPortfolioBalance();
        await portfolioMainPage.selectTokenByIndex(0);
        const mainBalanceDetailsPage = await detailsPage.getMainBalance();
        const secondsBalanceDetailsPage = await detailsPage.getSecondBalance();

        expect(mainBalanceDetailsPage.value).to.be.equal(balanceMainPage.main.value);
        expect(mainBalanceDetailsPage.fiat).to.be.equal(balanceMainPage.main.fiat);
        expect(secondsBalanceDetailsPage.value).to.be.equal(balanceMainPage.secondary.value);
        expect(secondsBalanceDetailsPage.fiat).to.be.equal(balanceMainPage.secondary.fiat);
      });
    });
  }

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
