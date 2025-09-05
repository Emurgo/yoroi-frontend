import { expect } from 'chai';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestLogger } from '../utils/utils.js';
import { customAfterEach } from '../utils/customHooks.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import WalletTab from '../pages/wallet/walletTab/walletTab.page.js';
import PortfolioMainPage from '../pages/wallet/portfolio/portfolioMain.page.js';
import PortfolioDetailPage from '../pages/wallet/portfolio/portfolioDetail.page.js';
import BasePage from '../pages/basepage.js';

describe('Portfolio Token Details', function () {
  this.timeout(2 * oneMinute);

  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Navigate to Portfolio and open ADA details', async function () {
    const walletTab = new WalletTab(webdriver, logger);
    await walletTab.goToPortfolioTab();

    // Verify we're on the portfolio page
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Open ADA details
    await portfolioPage.clickAssetByName('ADA');
  });

  it('Verify token details page elements', async function () {
    const portfolioDetailPage = new PortfolioDetailPage(webdriver, logger);

    // Details page should be displayed
    const isDetailPageDisplayed = await portfolioDetailPage.isDisplayed();
    expect(isDetailPageDisplayed, 'Portfolio detail page is not displayed').to.be.true;

    // Price chart present
    const isChartDisplayed = await portfolioDetailPage.isPriceChartDisplayed();
    expect(isChartDisplayed, 'Price chart is not displayed').to.be.true;
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
