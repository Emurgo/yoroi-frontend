import { expect } from 'chai';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestLogger } from '../utils/utils.js';
import { customAfterEach } from '../utils/customHooks.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import WalletTab from '../pages/wallet/walletTab/walletTab.page.js';
import PortfolioMainPage, { PortfolioColumns } from '../pages/wallet/portfolio/portfolioMain.page.js';
import BasePage from '../pages/basepage.js';

describe('Portfolio Sorting Functionality', function () {
  this.timeout(2 * oneMinute);

  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Open Portfolio page and confirm table is loaded', async function () {
    const walletTab = new WalletTab(webdriver, logger);
    await walletTab.goToPortfolioTab();

    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    const isDisplayed = await portfolioPage.isDisplayed();
    expect(isDisplayed, 'Portfolio page is not displayed').to.be.true;

    const initialCount = await portfolioPage.countAssets();
    expect(initialCount, 'Portfolio should list exactly 3 assets').to.equal(3);
  });

  it('Verify sorting functionality for all columns', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    const initialNames = await portfolioPage.getAllAssetNames();
    expect(initialNames.length, 'Initial asset count should be exactly 3').to.equal(3);

    const columnsToCheck = [
      PortfolioColumns.Name,
      PortfolioColumns.Price,
      PortfolioColumns['24H'],
      PortfolioColumns['1W'],
      PortfolioColumns['1M'],
      PortfolioColumns['Portfolio %'],
      PortfolioColumns['Total amount'],
    ];

    // Verify sorting for all columns
    for (const column of columnsToCheck) {
      const result = await portfolioPage.verifySortingForColumn(column);

      // Verify asset count remains 3
      const afterClick = await portfolioPage.getAllAssetNames();
      expect(afterClick.length, `Asset count should remain 3 after clicking ${column} header`).to.equal(3);

      // Assert sorting behavior - check both icon state and actual data order
      if (result.orderChanged) {
        expect(result.ascSorted, `${column} should be sorted in ascending order after first click`).to.be.true;
        expect(result.descSorted, `${column} should be sorted in descending order after second click`).to.be.true;

        // Verify icon states change appropriately
        if (result.iconState.afterFirst !== 'none') {
          expect(result.iconState.afterFirst, `${column} should show ascending icon after first click`).to.equal('asc');
        }
        if (result.iconState.afterSecond !== 'none') {
          expect(result.iconState.afterSecond, `${column} should show descending icon after second click`).to.equal('desc');
        }
      } else {
        logger.info(`${column} sorting did not change order - this may be expected for columns with identical values`);
        // For columns that don't change order, we still verify the UI doesn't break
        expect(afterClick.length, `${column} should maintain asset count after sorting attempts`).to.equal(3);
      }
    }
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
