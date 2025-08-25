import { expect } from 'chai';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestLogger } from '../utils/utils.js';
import { customAfterEach } from '../utils/customHooks.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import PortfolioMainPage from '../pages/wallet/portfolio/portfolioMain.page.js';
import BasePage from '../pages/basepage.js';

describe('Portfolio - verify values are loaded', function () {
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

  it('Headers should be displayed', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    const headersOk = await portfolioPage.areHeaderLabelsDisplayed([
      'Name',
      'Price',
      '24H',
      '1W',
      '1M',
      'Portfolio %',
      'Total amount',
    ]);
    expect(headersOk, 'One or more portfolio headers are missing').to.be.true;
  });

  it('Portfolio values should be loaded and displayed', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify all value columns have valid data loaded
    const allValuesLoaded = await portfolioPage.areAllValuesLoaded();
    expect(allValuesLoaded, 'One or more value columns are missing valid data').to.be.true;

    // Verify individual value columns for better error reporting
    const priceValuesOk = await portfolioPage.arePriceValuesDisplayed();
    expect(priceValuesOk, 'Price values are not properly loaded').to.be.true;

    const change24HValuesOk = await portfolioPage.are24HChangeValuesDisplayed();
    expect(change24HValuesOk, '24H change values are not properly loaded').to.be.true;

    const portfolioValuesOk = await portfolioPage.arePortfolioPercentageValuesDisplayed();
    expect(portfolioValuesOk, 'Portfolio percentage values are not properly loaded').to.be.true;

    const amountValuesOk = await portfolioPage.areTotalAmountValuesDisplayed();
    expect(amountValuesOk, 'Total amount values are not properly loaded').to.be.true;

    // Wait 10 seconds to see the final state
    await new Promise(resolve => setTimeout(resolve, 10000));
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
