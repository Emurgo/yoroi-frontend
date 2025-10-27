import { customAfterEach } from '../../../utils/customHooks.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import BasePage from '../../../pages/basepage.js';
import WalletTab from '../../../pages/wallet/walletTab/walletTab.page.js';
import PortfolioTab from '../../../pages/wallet/portfolio/porfolioMain.page.js';
import { getTestString } from '../../../helpers/constants.js';

describe('Portfolio Search a random string', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Open Portfolio page', async function () {
    const walletCommonPage = new WalletTab(webdriver, logger);
    await walletCommonPage.goToPortfolioTab();
    const portfolioMainPage = new PortfolioTab(webdriver, logger);
    const pageIsDisplayed = await portfolioMainPage.isDisplayed();
    expect(pageIsDisplayed, 'Portfolio page is not displayed').to.be.true;
    const isLoaded = await portfolioMainPage.waitIsLoaded();
    expect(isLoaded, 'Portfolio page is not loaded').to.be.true;
  });

  it('Search by random string', async function () {
    const randomString = getTestString('', 56, false);
    const portfolioMainPage = new PortfolioTab(webdriver, logger);
    await portfolioMainPage.search(randomString);
    const noResultsDisplayed = await portfolioMainPage.noResultsFound();
    expect(noResultsDisplayed, 'Something is found for a random string').to.be.true;
  });

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
