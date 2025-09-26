import { customAfterEach } from '../utils/customHooks.js';
import { expect } from 'chai';
import { getRandomItem, getTestLogger } from '../utils/utils.js';
import driversPoolsManager from '../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import BasePage from '../pages/basepage.js';
import WalletTab from '../pages/wallet/walletTab/walletTab.page.js';
import PortfolioTab from '../pages/wallet/portfolio/porfolioMain.page.js';
import { allTokens } from '../helpers/tokensInfo.js';
import PortfolioTokenDetails from '../pages/wallet/portfolio/portfolioDetails.page.js';

describe('Portfolio page displayed', function () {
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
  });

  it('Count displayed tokens', async function () {
    const portfolioMainPage = new PortfolioTab(webdriver, logger);
    const tokensAmount = await portfolioMainPage.countTokens();
    expect(tokensAmount, 'Different amount of tokens is displayed').to.be.equal(allTokens.length);
  });

  it('Open a random token', async function () {
    const portfolioMainPage = new PortfolioTab(webdriver, logger);
    const indexesArr = allTokens.map((_, index) => index);
    const randomIndex = getRandomItem(indexesArr);
    await portfolioMainPage.selectTokenByIndex(randomIndex);
    const tokenDetailsPage = new PortfolioTokenDetails(webdriver, logger);
    const pageIsDisplayed = await tokenDetailsPage.isDisplayed();
    expect(pageIsDisplayed, 'The token details page is not displayed').to.be.true;
  });

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
