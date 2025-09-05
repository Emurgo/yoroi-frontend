import { expect } from 'chai';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestLogger } from '../utils/utils.js';
import { customAfterEach } from '../utils/customHooks.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import WalletTab from '../pages/wallet/walletTab/walletTab.page.js';
import PortfolioMainPage from '../pages/wallet/portfolio/portfolioMain.page.js';
import BasePage from '../pages/basepage.js';

describe('Portfolio Search Functionality', function () {
  this.timeout(2 * oneMinute);

  let webdriver = null;
  let logger = null;
  let initialAssetCount = 0;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Search existing token (ADA)', async function () {
    const walletTab = new WalletTab(webdriver, logger);
    await walletTab.goToPortfolioTab();

    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    initialAssetCount = await portfolioPage.countAssets();
    expect(initialAssetCount, 'Initial asset count should be exactly 3').to.equal(3);

    await portfolioPage.searchForAsset('ADA');
    await portfolioPage.waitForSearchResults();

    const searchResultCount = await portfolioPage.countAssets();
    expect(searchResultCount, 'Search results should show exactly 1 ADA token').to.equal(1);
  });

  it('Search non-existing token', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    await portfolioPage.searchForAsset('NONEXISTENTTOKEN');
    await portfolioPage.waitForSearchResults();

    const noResultCount = await portfolioPage.countAssets();
    expect(noResultCount, 'No results expected for non-existing token').to.equal(0);

    const noResultsMessageDisplayed = await portfolioPage.isNoResultsMessageDisplayed();
    expect(noResultsMessageDisplayed, 'No results message should be displayed').to.be.true;
  });

  it('Clear search and verify full list', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Clear and ensure we returned to the original number of assets
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
