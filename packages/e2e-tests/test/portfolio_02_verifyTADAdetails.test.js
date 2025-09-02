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

describe('Portfolio - verify TADA details', function () {
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

    // Verify we're on the portfolio page
    const currentTitle = await walletCommon.getPageTitle();
    expect(currentTitle).to.equal(pageTitle.portfolio, `Expected to be on ${pageTitle.portfolio} page`);

    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    const isDisplayed = await portfolioPage.isDisplayed();
    expect(isDisplayed, 'Portfolio page is not displayed').to.be.true;
  });

  it('Searches for TADA and navigates to details', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Click on TADA to open details (using the first asset since we know TADA exists)
    logger.info('Clicking on TADA to open details');
    await portfolioPage.clickFirstAsset();

    // Wait for navigation to details page
    logger.info('Waiting for navigation to details page...');
    await portfolioPage.sleep(twoSeconds);
  });

  it('Verifies TADA details page elements are displayed', async function () {
    const portfolioDetailPage = new PortfolioDetailPage(webdriver, logger);

    // Verify the detail page is displayed
    logger.info('Checking if detail page is displayed...');
    const isDetailPageDisplayed = await portfolioDetailPage.isDisplayed();
    logger.info(`Detail page displayed: ${isDetailPageDisplayed}`);
    expect(isDetailPageDisplayed, 'Portfolio detail page is not displayed').to.be.true;

    // Verify new ID-based elements for better reliability
    const tokenBalanceLabelDisplayed = await portfolioDetailPage.isTokenBalanceLabelDisplayed();
    expect(tokenBalanceLabelDisplayed, 'Token balance label is not displayed').to.be.true;

    const tokenBalanceAmountDisplayed = await portfolioDetailPage.isTokenBalanceAmountDisplayed();
    expect(tokenBalanceAmountDisplayed, 'Token balance amount is not displayed').to.be.true;

    const tokenNameDisplayed = await portfolioDetailPage.isTokenNameDisplayed();
    expect(tokenNameDisplayed, 'Token name is not displayed').to.be.true;

    const tokenBalanceValueDisplayed = await portfolioDetailPage.isTokenBalanceValueDisplayed();
    expect(tokenBalanceValueDisplayed, 'Token balance value is not displayed').to.be.true;

    // Get and log token information for verification
    const tokenName = await portfolioDetailPage.getTokenName();
    logger.info(`Token name: ${tokenName}`);
    
    const balanceAmount = await portfolioDetailPage.getTokenBalanceAmount();
    logger.info(`Balance amount: ${balanceAmount}`);
    
    const balanceValue = await portfolioDetailPage.getTokenBalanceValue();
    logger.info(`Balance value: ${balanceValue}`);
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
