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
import PortfolioTokenDetails from '../../../pages/wallet/portfolio/portfolioDetails.page.js';

describe('Portfolio Check the displayed balance', function () {
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

  it('Check the displayed balance on main page', async function () {
    const pageIsLoaded = await portfolioMainPage.waitIsLoaded();
    expect(pageIsLoaded, 'Portfolio is not loaded').to.be.true;
    const portfolioBalance = await portfolioMainPage.getPortfolioBalance();
    const topBarBalance = await portfolioMainPage.getSelectedWalletInfo();
    expect(portfolioBalance.main.value, 'Portfolio ada balance is different from the top-bar').to.be.equal(topBarBalance.balance);
    expect(portfolioBalance.secondary.value, 'Portfolio fiat balance is different from the top-bar').to.be.equal(
      topBarBalance.fiatBalance
    );
    expect(portfolioBalance.secondary.fiat, 'Portfolio fiat currency is different from the top-bar').to.be.equal(
      topBarBalance.fiatCurrency
    );
  });

  it('Check the displayed balance on details page', async function () {
    // ADA token is first by default if there is no sorting applied
    await portfolioMainPage.selectTokenByIndex(0);
    const topBarBalance = await portfolioMainPage.getSelectedWalletInfo();
    const mainCurrency = await tokenDetailsPage.getMainBalance();
    expect(mainCurrency.value, 'Token details. ADA balance is different from the top-bar').to.be.equal(topBarBalance.balance);
    const secondCurrency = await tokenDetailsPage.getSecondBalance();
    expect(secondCurrency.value, 'Token details. Fiat balance is different from the top-bar').to.be.equal(
      topBarBalance.fiatBalance
    );
    expect(secondCurrency.fiat, 'Token details. Fiat currency is different from the top-bar').to.be.equal(
      topBarBalance.fiatCurrency
    );
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletCommonPage.closeBrowser();
  });
});
