import { expect } from 'chai';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestLogger } from '../utils/utils.js';
import { customAfterEach } from '../utils/customHooks.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import PortfolioMainPage from '../pages/wallet/portfolio/portfolioMain.page.js';
import PortfolioDetailPage from '../pages/wallet/portfolio/portfolioDetail.page.js';
import BasePage from '../pages/basepage.js';

describe('Portfolio - verify TADA details', function () {
  this.timeout(2 * oneMinute);

  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    // Load a prepared wallet into IndexedDB and storages
    await prepareWallet(webdriver, logger, 'testWallet1', this);
  });

  it('Open Portfolio page', async function () {
    const walletCommon = new WalletCommonBase(webdriver, logger);
    await walletCommon.goToPortfolioTab();

    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    const isDisplayed = await portfolioPage.isDisplayed();
    expect(isDisplayed, 'Portfolio page is not displayed').to.be.true;
  });

  it('Search for TADA and click to open details', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Search for TADA on the main portfolio page
    logger.info('Searching for TADA in portfolio...');
    await portfolioPage.searchForAsset('TADA');

    // Wait a moment for search results to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify TADA is displayed after search
    const tadaExists = await portfolioPage.isAssetDisplayed('TADA');
    expect(tadaExists, 'TADA row is not displayed after search').to.be.true;

    // Click on TADA to open details
    logger.info('Clicking on TADA to open details');
    await portfolioPage.clickAssetByName('TADA');

    // Wait longer for navigation to details page
    logger.info('Waiting for navigation to details page...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check current URL to see if navigation worked
    const currentUrl = await webdriver.getCurrentUrl();
    logger.info(`Current URL after clicking: ${currentUrl}`);
  });

  it('Verify TADA details page elements are displayed', async function () {
    const portfolioDetailPage = new PortfolioDetailPage(webdriver, logger);

    // Check current URL first
    const currentUrl = await webdriver.getCurrentUrl();
    logger.info(`Current URL in detail verification: ${currentUrl}`);

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

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
