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

describe('Portfolio Search existing token', function () {
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

  it('Search by name', async function () {
    const randomToken = getRandomItem(allTokens);
    const portfolioMainPage = new PortfolioTab(webdriver, logger);
    await portfolioMainPage.search(randomToken.name);
    const amount = await portfolioMainPage.countTokens();
    expect(amount, 'Different amount of tokens is found').to.be.equal(1);
    const foundToken = await portfolioMainPage.getTokenInfoByIndex(0);
    expect(foundToken.name, 'Different token is found').to.be.equal(randomToken.name);
  });

  it('Clean search input', async function () {
    const portfolioMainPage = new PortfolioTab(webdriver, logger);
    await portfolioMainPage.cleanSearch();
  });

  it('Search by policyId', async function () {
    const randomToken = getRandomItem(allTokens);
    const portfolioMainPage = new PortfolioTab(webdriver, logger);
    if (randomToken.policyId === null) {
      // in case ADA is chosen we need to search by name
      await portfolioMainPage.search(randomToken.name);
    } else {
      await portfolioMainPage.search(randomToken.policyId);
    }
    const amount = await portfolioMainPage.countTokens();
    expect(amount, 'Different amount of tokens is found').to.be.equal(1);
    const foundToken = await portfolioMainPage.getTokenInfoByIndex(0);
    expect(foundToken.name, 'Different token is found').to.be.equal(randomToken.name);

    await portfolioMainPage.selectTokenByIndex(0);
    const tokenDetailsPage = new PortfolioTokenDetails(webdriver, logger);
    const tokenDetails = await tokenDetailsPage.getTokenInfo();
    expect(tokenDetails.name, 'Token name is different').to.be.equal(randomToken.name);
    expect(tokenDetails.policyId, 'Token policyID is different').to.be.equal(randomToken.policyId);
    expect(tokenDetails.cardanoscanLink, "Token's cardanoScan link is different").to.be.equal(randomToken.cardanoscanLink);
  });

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
