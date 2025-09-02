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

describe('Portfolio - search functionality', function () {
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

  it('Searches for existing token and verifies results', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Get initial asset count
    const initialAssetCount = await portfolioPage.countAssets();
    expect(initialAssetCount, 'Initial asset count should be greater than 0').to.be.greaterThan(0);

    // Search for TADA (should exist)
    await portfolioPage.searchForAsset('TADA');
    await portfolioPage.waitForSearchResults();

    // Verify TADA is displayed
    const tadaExists = await portfolioPage.isAssetDisplayed('TADA');
    expect(tadaExists, 'TADA should be displayed after search').to.be.true;

    // In single-token portfolio the results count will still be 1
    const searchResultCount = await portfolioPage.countAssets();
    expect(searchResultCount, 'Search results should contain the TADA token').to.equal(1);
  });

  it('Searches for non-existing token and verifies no results', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Search for a non-existing token
    const nonExistingToken = 'NONEXISTENTTOKEN123';
    await portfolioPage.searchForAsset(nonExistingToken);
    await portfolioPage.waitForSearchResults();

    // Verify no results are displayed
    const searchResultCount = await portfolioPage.countAssets();
    expect(searchResultCount, 'No assets should be displayed for non-existing token').to.equal(0);

    // Verify "No results for this search" banner state (derived from empty list)
    const noResultsMessageDisplayed = await portfolioPage.isNoResultsMessageDisplayed();
    expect(noResultsMessageDisplayed, 'No results message should be displayed').to.be.true;
  });

  it('Clears search field and verifies all assets are displayed', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    // Clear the search
    await portfolioPage.clearSearch();
    await portfolioPage.waitForSearchResults();

    // Verify all assets are displayed again (still 1 for single-token wallet)
    const totalCount = await portfolioPage.countAssets();
    expect(totalCount, 'All assets should be displayed after clearing search').to.equal(1);

    // Verify search input is empty
    const searchInputValue = await portfolioPage.getSearchInputValue();
    expect(searchInputValue, 'Search input should be empty after clearing').to.equal('');
  });

  it('Searches with partial token name and verifies results', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    // Search with partial name
    await portfolioPage.searchForAsset('TAD');
    await portfolioPage.waitForSearchResults();

    // Verify results are displayed
    const searchResultCount = await portfolioPage.countAssets();
    expect(searchResultCount, 'Assets should be displayed when searching with partial name').to.be.greaterThan(0);

    // Verify TADA is included in results
    const tadaExists = await portfolioPage.isAssetDisplayed('TADA');
    expect(tadaExists, 'TADA should be displayed when searching with partial name').to.be.true;
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
