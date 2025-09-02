import { expect } from 'chai';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestLogger } from '../utils/utils.js';
import { customAfterEach } from '../utils/customHooks.js';
import { oneMinute, twoSeconds } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import PortfolioMainPage from '../pages/wallet/portfolio/portfolioMain.page.js';
import BasePage from '../pages/basepage.js';
import { pageTitle } from '../helpers/pageTitles.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';

describe('Portfolio - verify balance and fiat display', function () {
  this.timeout(2 * oneMinute);

  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1', this);
  });

  it('Navigates to Portfolio page', async function () {
    const walletCommon = new WalletCommonBase(webdriver, logger);
    await walletCommon.goToPortfolioTab();
    await walletCommon.sleep(twoSeconds);

    const currentTitle = await walletCommon.getPageTitle();
    expect(currentTitle).to.equal(pageTitle.portfolio, `Expected to be on ${pageTitle.portfolio} page`);

    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    const isDisplayed = await portfolioPage.isDisplayed();
    expect(isDisplayed, 'Portfolio page is not displayed').to.be.true;
  });

  it('Verifies portfolio balance is displayed and matches expected value', async function () {
    const walletCommon = new WalletCommonBase(webdriver, logger);
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Wait for balances to load
    await portfolioPage.waitForBalanceToLoad();

    // Get balance from the top bar (transactions context)
    const walletInfo = await walletCommon.getSelectedWalletInfo();
    const topBarAdaBalance = walletInfo.balance; // number

    // Get portfolio balance text and parse number
    const portfolioBalanceText = await portfolioPage.getPortfolioBalance();
    const portfolioAdaBalance = Number((portfolioBalanceText || '').toString().replace(/[^0-9.]/g, ''));

    logger.info(`Top bar ADA balance: ${topBarAdaBalance}, Portfolio ADA balance: ${portfolioAdaBalance}`);

    expect(portfolioAdaBalance, 'Portfolio balance should be a valid number').to.be.a('number');
    expect(portfolioAdaBalance).to.equal(topBarAdaBalance);
  });

  it('Verifies fiat balance is displayed when currency is switched', async function () {
    const walletCommon = new WalletCommonBase(webdriver, logger);

    // Go to Settings -> General and change fiat to USD
    await walletCommon.goToSettingsTab();
    const settingsPage = new SettingsTab(webdriver, logger);
    await settingsPage.goToGeneralSubMenu();
    const generalSettings = new GeneralSubTab(webdriver, logger);
    await generalSettings.selectFiat('USD');

    // Return to Portfolio and verify top bar fiat currency reflects the change
    await walletCommon.goToPortfolioTab();
    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    await portfolioPage.waitForBalanceToUpdate();

    const walletInfoAfter = await walletCommon.getSelectedWalletInfo();
    expect(walletInfoAfter.fiatCurrency, 'Fiat currency should be USD after switching in settings').to.equal('USD');
  });

  it('Verifies balance changes when switching between different fiat currencies', async function () {
    const walletCommon = new WalletCommonBase(webdriver, logger);

    // Switch to EUR
    await walletCommon.goToSettingsTab();
    const settingsPage = new SettingsTab(webdriver, logger);
    await settingsPage.goToGeneralSubMenu();
    const generalSettings = new GeneralSubTab(webdriver, logger);
    await generalSettings.selectFiat('EUR');

    // Back to portfolio and verify currency code changed
    await walletCommon.goToPortfolioTab();
    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    await portfolioPage.waitForBalanceToUpdate();

    const walletInfoEUR = await walletCommon.getSelectedWalletInfo();
    expect(walletInfoEUR.fiatCurrency, 'Fiat currency should be EUR after switching in settings').to.equal('EUR');
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
