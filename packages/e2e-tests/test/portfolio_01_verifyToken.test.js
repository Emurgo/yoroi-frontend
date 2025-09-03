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

describe('Portfolio Token Verification', function () {
  this.timeout(2 * oneMinute);

  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Navigate to Portfolio page and verify token display', async function () {
    const walletCommon = new WalletCommonBase(webdriver, logger);
    await walletCommon.goToPortfolioTab();
    await walletCommon.sleep(twoSeconds);

    // Verify we're on the portfolio page
    const currentTitle = await walletCommon.getPageTitle();
    expect(currentTitle).to.equal(pageTitle.portfolio, `Expected to be on ${pageTitle.portfolio} page`);

    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    const isDisplayed = await portfolioPage.isDisplayed();
    expect(isDisplayed, 'Portfolio page is not displayed').to.be.true;

    // Verify ADA token is displayed in portfolio
    const isAdaDisplayed = await portfolioPage.isAssetDisplayed('ADA');
    expect(isAdaDisplayed, 'ADA token is not displayed in portfolio').to.be.true;

    // Verify asset count
    const assetCount = await portfolioPage.countAssets();
    expect(assetCount, 'Asset count should be greater than 0').to.be.greaterThan(0);
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
