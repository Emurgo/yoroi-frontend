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

describe('Portfolio - sorting functionality', function () {
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

  it('Sorts tokens by Name column in ascending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Wait for data to load
    await portfolioPage.waitForDataToLoad();

    // Get initial order of names
    const initialNames = await portfolioPage.getAssetNamesInOrder();
    expect(initialNames.length, 'Should have assets to sort').to.be.greaterThan(0);

    // Sort by Name column
    await portfolioPage.sortByColumn('Name');
    await portfolioPage.waitForSortingToComplete();

    // Get sorted order of names
    const sortedNames = await portfolioPage.getAssetNamesInOrder();
    expect(sortedNames.length, 'Should have same number of assets after sorting').to.equal(initialNames.length);

    // Verify sorting worked (ascending order)
    const isSorted = await portfolioPage.verifyNameSorting('ascending');
    expect(isSorted, 'Names should be sorted in ascending order').to.be.true;
  });

  it('Sorts tokens by Name column in descending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by Name column again (should reverse order)
    await portfolioPage.sortByColumn('Name');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (descending order)
    const isSorted = await portfolioPage.verifyNameSorting('descending');
    expect(isSorted, 'Names should be sorted in descending order').to.be.true;
  });

  it('Sorts tokens by Price column in ascending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by Price column
    await portfolioPage.sortByColumn('Price');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (ascending order)
    const isSorted = await portfolioPage.verifyPriceSorting('ascending');
    expect(isSorted, 'Prices should be sorted in ascending order').to.be.true;
  });

  it('Sorts tokens by Price column in descending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by Price column again (should reverse order)
    await portfolioPage.sortByColumn('Price');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (descending order)
    const isSorted = await portfolioPage.verifyPriceSorting('descending');
    expect(isSorted, 'Prices should be sorted in descending order').to.be.true;
  });

  it('Sorts tokens by 24H column in ascending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by 24H column
    await portfolioPage.sortByColumn('24H');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (ascending order)
    const isSorted = await portfolioPage.verify24HChangeSorting('ascending');
    expect(isSorted, '24H changes should be sorted in ascending order').to.be.true;
  });

  it('Sorts tokens by 24H column in descending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by 24H column again (should reverse order)
    await portfolioPage.sortByColumn('24H');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (descending order)
    const isSorted = await portfolioPage.verify24HChangeSorting('descending');
    expect(isSorted, '24H changes should be sorted in descending order').to.be.true;
  });

  it('Sorts tokens by 1W column in ascending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by 1W column
    await portfolioPage.sortByColumn('1W');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (ascending order)
    const isSorted = await portfolioPage.verify1WChangeSorting('ascending');
    expect(isSorted, '1W changes should be sorted in ascending order').to.be.true;
  });

  it('Sorts tokens by 1W column in descending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by 1W column again (should reverse order)
    await portfolioPage.sortByColumn('1W');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (descending order)
    const isSorted = await portfolioPage.verify1WChangeSorting('descending');
    expect(isSorted, '1W changes should be sorted in descending order').to.be.true;
  });

  it('Sorts tokens by 1M column in ascending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by 1M column
    await portfolioPage.sortByColumn('1M');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (ascending order)
    const isSorted = await portfolioPage.verify1MChangeSorting('ascending');
    expect(isSorted, '1M changes should be sorted in ascending order').to.be.true;
  });

  it('Sorts tokens by 1M column in descending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by 1M column again (should reverse order)
    await portfolioPage.sortByColumn('1M');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (descending order)
    const isSorted = await portfolioPage.verify1MChangeSorting('descending');
    expect(isSorted, '1M changes should be sorted in descending order').to.be.true;
  });

  it('Sorts tokens by Portfolio % column in ascending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by Portfolio % column
    await portfolioPage.sortByColumn('Portfolio %');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (ascending order)
    const isSorted = await portfolioPage.verifyPortfolioPercentageSorting('ascending');
    expect(isSorted, 'Portfolio percentages should be sorted in ascending order').to.be.true;
  });

  it('Sorts tokens by Portfolio % column in descending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by Portfolio % column again (should reverse order)
    await portfolioPage.sortByColumn('Portfolio %');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (descending order)
    const isSorted = await portfolioPage.verifyPortfolioPercentageSorting('descending');
    expect(isSorted, 'Portfolio percentages should be sorted in descending order').to.be.true;
  });

  it('Sorts tokens by Total amount column in ascending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by Total amount column
    await portfolioPage.sortByColumn('Total amount');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (ascending order)
    const isSorted = await portfolioPage.verifyTotalAmountSorting('ascending');
    expect(isSorted, 'Total amounts should be sorted in ascending order').to.be.true;
  });

  it('Sorts tokens by Total amount column in descending order', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Sort by Total amount column again (should reverse order)
    await portfolioPage.sortByColumn('Total amount');
    await portfolioPage.waitForSortingToComplete();

    // Verify sorting worked (descending order)
    const isSorted = await portfolioPage.verifyTotalAmountSorting('descending');
    expect(isSorted, 'Total amounts should be sorted in descending order').to.be.true;
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
