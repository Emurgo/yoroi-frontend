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

describe('Portfolio Balance and Fiat', function () {
  this.timeout(2 * oneMinute);

  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Verify portfolio balance and fiat currency display', async function () {
    const walletCommon = new WalletCommonBase(webdriver, logger);
    await walletCommon.goToPortfolioTab();
    await walletCommon.sleep(twoSeconds);
    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    
    // Verify portfolio balance is displayed
    const portfolioBalance = await portfolioPage.getPortfolioBalance();
    expect(portfolioBalance, 'Portfolio balance should be displayed').to.not.be.empty;

    // Verify the balance matches the wallet balance from top bar
    const walletInfo = await walletCommon.getSelectedWalletInfo();
    const topBarAda = Number(walletInfo.balance);
    const portfolioAda = Number((portfolioBalance || '').toString().replace(/[^0-9.]/g, ''));
    expect(portfolioAda, 'Portfolio balance should be a valid number').to.be.a('number');
    expect(portfolioAda, 'Portfolio balance should match top bar balance').to.equal(topBarAda);
  });

  it('Switch fiat currency in settings and verify change', async function () {
    const walletCommon = new WalletCommonBase(webdriver, logger);
    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    

    await walletCommon.goToSettingsTab();
    const settingsPage = new SettingsTab(webdriver, logger);
    await settingsPage.goToGeneralSubMenu();
    
    // Select different fiat currency
    const generalSubTab = new GeneralSubTab(webdriver, logger);
    await generalSubTab.selectFiat('EUR');
    
    // Go back to Portfolio to verify the change
    await walletCommon.goToPortfolioTab();
    await portfolioPage.waitForBalanceToUpdate();
    
    // Verify portfolio balance is still displayed after currency change
    const updatedPortfolioBalance = await portfolioPage.getPortfolioBalance();
    expect(updatedPortfolioBalance, 'Portfolio balance should still be displayed after currency change').to.not.be.empty;

    // Verify token prices are displayed in EUR on the portfolio page
    const pricesInEUR = await portfolioPage.arePricesInCurrency('EUR');
    expect(pricesInEUR, 'Token prices should be displayed in EUR after switching fiat').to.be.true;
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
