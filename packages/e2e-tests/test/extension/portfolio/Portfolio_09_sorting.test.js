import { customAfterEach } from '../../../utils/customHooks.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import WalletTab from '../../../pages/wallet/walletTab/walletTab.page.js';
import PortfolioTab from '../../../pages/wallet/portfolio/porfolioMain.page.js';
import { Columns, defineSortingDirection, getValuesForSorting } from '../../../helpers/portfolioHelper.js';
import { allTokens } from '../../../helpers/tokensInfo.js';

describe('Portfolio Sorting columns', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {WalletTab} */
  let walletCommonPage = null;
  /** @type {PortfolioTab} */
  let portfolioMainPage = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
    walletCommonPage = new WalletTab(webdriver, logger);
    portfolioMainPage = new PortfolioTab(webdriver, logger);
  });

  it('Open Portfolio page', async function () {
    await walletCommonPage.goToPortfolioTab();
    const pageIsDisplayed = await portfolioMainPage.isDisplayed();
    expect(pageIsDisplayed, 'Portfolio page is not displayed').to.be.true;
    const isLoaded = await portfolioMainPage.waitIsLoaded();
    expect(isLoaded, 'Portfolio page is not loaded').to.be.true;
  });

  it('Count displayed tokens', async function () {
    const tokensAmount = await portfolioMainPage.countTokens();
    expect(tokensAmount, 'Different amount of tokens is displayed').to.be.equal(allTokens.length);
  });

  for (const columnName in Columns) {
    it(`Sort by column ${columnName} and check sorting`, async function () {
      await portfolioMainPage.sortBy(Columns[columnName]);
      const arrowSortingDirection = await portfolioMainPage.getSortingArrowDirection(Columns[columnName]);
      const columnsRawValues = await portfolioMainPage.getColumnValues(Columns[columnName]);
      const columnValues = getValuesForSorting(columnName, columnsRawValues);
      const valuesDirection = defineSortingDirection(columnValues);
      expect(arrowSortingDirection, 'Arrow direction and values direction are different').to.be.equal(valuesDirection);

      await portfolioMainPage.sortBy(Columns[columnName]);
      const changedArrowSortingDirection = await portfolioMainPage.getSortingArrowDirection(Columns[columnName]);
      const updatedColumnRawValues = await portfolioMainPage.getColumnValues(Columns[columnName]);
      const updatedColumnValues = getValuesForSorting(columnName, updatedColumnRawValues);
      const changedValuesDirection = defineSortingDirection(updatedColumnValues);
      expect(changedArrowSortingDirection, 'Arrow direction and values direction are different after second click').to.be.equal(
        changedValuesDirection
      );

      expect(arrowSortingDirection !== changedArrowSortingDirection, 'Arrow direction is not changed').to.be.true;
      expect(valuesDirection !== changedValuesDirection, 'Arrow direction is not changed').to.be.true;
    });
  }

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletCommonPage.closeBrowser();
  });
});
