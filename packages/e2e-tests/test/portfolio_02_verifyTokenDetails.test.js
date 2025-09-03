import { expect } from 'chai';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestLogger } from '../utils/utils.js';
import { customAfterEach } from '../utils/customHooks.js';
import { oneMinute, twoSeconds } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import PortfolioMainPage from '../pages/wallet/portfolio/portfolioMain.page.js';
import PortfolioDetailPage from '../pages/wallet/portfolio/portfolioDetail.page.js';
import BasePage from '../pages/basepage.js';
import { pageTitle } from '../helpers/pageTitles.js';

describe('Portfolio Token Details', function () {
  this.timeout(2 * oneMinute);

  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Navigate to token details and verify elements', async function () {
    const walletCommon = new WalletCommonBase(webdriver, logger);
    await walletCommon.goToPortfolioTab();
    await walletCommon.sleep(twoSeconds);

    // Verify we're on the portfolio page
    const currentTitle = await walletCommon.getPageTitle();
    expect(currentTitle).to.equal(pageTitle.portfolio, `Expected to be on ${pageTitle.portfolio} page`);

    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    const isDisplayed = await portfolioPage.isDisplayed();
    expect(isDisplayed, 'Portfolio page is not displayed').to.be.true;
    
    // Click on ADA token to view details
    await portfolioPage.clickAssetByName('ADA');
    await portfolioPage.waitForNavigationToDetails();

    // Verify we're on the token details page
    const portfolioDetailPage = new PortfolioDetailPage(webdriver, logger);
    const isDetailPageDisplayed = await portfolioDetailPage.isDisplayed();
    expect(isDetailPageDisplayed, 'Portfolio detail page is not displayed').to.be.true;

    // Verify token details are displayed
    const isBalanceLabelDisplayed = await portfolioDetailPage.isTokenBalanceLabelDisplayed();
    expect(isBalanceLabelDisplayed, 'Token balance label is not displayed').to.be.true;

    const isBalanceAmountDisplayed = await portfolioDetailPage.isTokenBalanceAmountDisplayed();
    expect(isBalanceAmountDisplayed, 'Token balance amount is not displayed').to.be.true;

    const isTokenNameDisplayed = await portfolioDetailPage.isTokenNameDisplayed();
    expect(isTokenNameDisplayed, 'Token name is not displayed').to.be.true;
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
