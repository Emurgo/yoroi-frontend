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
import { callRedirection, RedirectionButtons } from '../helpers/portfolioHelper.js';

describe('Portfolio Redirection from token details', function () {
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

  const testData = Object.keys(RedirectionButtons);

  for (const testDatum of testData) {
    describe(`Redirection to ${testDatum}`, function () {
      const btnValue = RedirectionButtons[testDatum];

      it('Open Portfolio page', async function () {
        const walletCommonPage = new WalletTab(webdriver, logger);
        await walletCommonPage.goToPortfolioTab();
        const portfolioMainPage = new PortfolioTab(webdriver, logger);
        const pageIsDisplayed = await portfolioMainPage.isDisplayed();
        expect(pageIsDisplayed, 'Portfolio page is not displayed').to.be.true;
        const isLoaded = await portfolioMainPage.waitIsLoaded();
        expect(isLoaded, 'Portfolio page is not loaded').to.be.true;
      });

      const randomToken = getRandomItem(allTokens);

      it(`Open ${randomToken.name} token details`, async function () {
        const portfolioMainPage = new PortfolioTab(webdriver, logger);
        await portfolioMainPage.selectTokenByName(randomToken.name);
        const tokenDetailsPage = new PortfolioTokenDetails(webdriver, logger);
        const pageIsDisplayed = await tokenDetailsPage.isDisplayed();
        expect(pageIsDisplayed, 'Token details page is not displayed').to.be.true;
      });

      it(`Check ${testDatum} redirection`, async function () {
        const redirectionState = await callRedirection(btnValue, webdriver, logger);
        expect(redirectionState, `${testDatum} page is not displayed`).to.be.true;
      });
    });
  }

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
