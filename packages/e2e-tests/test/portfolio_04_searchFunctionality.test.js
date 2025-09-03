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

describe('Portfolio Search Functionality', function () {
  this.timeout(2 * oneMinute);

  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Test portfolio search functionality', async function () {
    const walletCommon = new WalletCommonBase(webdriver, logger);
    await walletCommon.goToPortfolioTab();
    await walletCommon.sleep(twoSeconds);

    // Verify we're on the portfolio page
    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    await portfolioPage.waitForDataToLoad();

    // Get initial asset count
    const initialAssetCount = await portfolioPage.countAssets();
    expect(initialAssetCount, 'Initial asset count should be greater than 0').to.be.greaterThan(0);

    // Search for existing token (ADA)
    await portfolioPage.searchForAsset('ADA');
    await portfolioPage.waitForSearchResults();

    // Verify search results show ADA
    const searchResultCount = await portfolioPage.countAssets();
    expect(searchResultCount, 'Search results should show ADA token').to.be.greaterThan(0);

    // Search for non-existing token
    await portfolioPage.searchForAsset('NONEXISTENT_TOKEN');
    await portfolioPage.waitForSearchResults();

    // Verify no results message is displayed
    const isNoResultsDisplayed = await portfolioPage.isNoResultsMessageDisplayed();
    expect(isNoResultsDisplayed, 'No results message should be displayed').to.be.true;

    // Clear search and verify all assets are shown again
    await portfolioPage.clearSearch();
    await portfolioPage.waitForSearchResults();

    const finalAssetCount = await portfolioPage.countAssets();
    expect(finalAssetCount, 'All assets should be displayed after clearing search').to.equal(initialAssetCount);
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
