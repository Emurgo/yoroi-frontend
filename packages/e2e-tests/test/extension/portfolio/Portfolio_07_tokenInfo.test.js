import { customAfterEach } from '../../../utils/customHooks.js';
import { expect } from 'chai';
import { getRandomItem, getTestLogger } from '../../../utils/utils.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import WalletTab from '../../../pages/wallet/walletTab/walletTab.page.js';
import PortfolioTab from '../../../pages/wallet/portfolio/porfolioMain.page.js';
import { allTokens } from '../../../helpers/tokensInfo.js';
import PortfolioTokenDetails from '../../../pages/wallet/portfolio/portfolioDetails.page.js';

describe('Portfolio Check token Details', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {WalletTab} */
  let walletCommonPage = null;
  /** @type {PortfolioTab} */
  let portfolioMainPage = null;
  /** @type {PortfolioTokenDetails} */
  let tokenDetailsPage = null;
  const randomToken = getRandomItem(allTokens);

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
    walletCommonPage = new WalletTab(webdriver, logger);
    portfolioMainPage = new PortfolioTab(webdriver, logger);
    tokenDetailsPage = new PortfolioTokenDetails(webdriver, logger);
  });

  it('Open Portfolio page', async function () {
    await walletCommonPage.goToPortfolioTab();
    const pageIsDisplayed = await portfolioMainPage.isDisplayed();
    expect(pageIsDisplayed, 'Portfolio page is not displayed').to.be.true;
    const isLoaded = await portfolioMainPage.waitIsLoaded();
    expect(isLoaded, 'Portfolio page is not loaded').to.be.true;
  });

  it(`Select token ${randomToken.name}`, async function () {
    await portfolioMainPage.selectTokenByName(randomToken.name);
    const pageIsDisplayed = await tokenDetailsPage.isDisplayed();
    expect(pageIsDisplayed, 'Token details page is not displayed').to.be.true;
  });

  it(`Check ${randomToken.name} token details`, async function () {
    const displayedTokenInfo = await tokenDetailsPage.getTokenInfo();
    expect(displayedTokenInfo, 'Displayed info is different').to.deep.equal(randomToken);
  });

  it('Return to the tokens list', async function () {
    await tokenDetailsPage.clickBack();
    const pageIsDisplayed = await portfolioMainPage.isDisplayed();
    expect(pageIsDisplayed, 'Portfolio page is not displayed').to.be.true;
    const isLoaded = await portfolioMainPage.waitIsLoaded();
    expect(isLoaded, 'Portfolio page is not loaded').to.be.true;
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletCommonPage.closeBrowser();
  });
});
