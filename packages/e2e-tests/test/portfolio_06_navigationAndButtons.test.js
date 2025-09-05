import { expect } from 'chai';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestLogger } from '../utils/utils.js';
import { customAfterEach } from '../utils/customHooks.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import WalletTab from '../pages/wallet/walletTab/walletTab.page.js';
import PortfolioMainPage from '../pages/wallet/portfolio/portfolioMain.page.js';
import PortfolioDetailPage from '../pages/wallet/portfolio/portfolioDetail.page.js';
import SendSubTab from '../pages/wallet/walletTab/sendSubTab.page.js';
import ReceiveSubTab from '../pages/wallet/walletTab/receiveSubTab.page.js';
import BasePage from '../pages/basepage.js';

describe('Portfolio Navigation and Buttons', function () {
  this.timeout(2 * oneMinute);

  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Navigate to Portfolio page', async function () {
    const walletTab = new WalletTab(webdriver, logger);
    await walletTab.goToPortfolioTab();

    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    const isDisplayed = await portfolioPage.isDisplayed();
    expect(isDisplayed, 'Portfolio page is not displayed').to.be.true;
  });

  it('Navigate to token details and return to portfolio table (Back button)', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    await portfolioPage.clickFirstAsset();

    const portfolioDetailPage = new PortfolioDetailPage(webdriver, logger);
    const isDetailPageDisplayed = await portfolioDetailPage.isDisplayed();
    expect(isDetailPageDisplayed, 'Portfolio detail page is not displayed').to.be.true;

    await portfolioDetailPage.clickBackButton();
    await portfolioPage.waitForNavigationToPortfolio();

    const isPortfolioDisplayed = await portfolioPage.isDisplayed();
    expect(isPortfolioDisplayed, 'Portfolio page is not displayed after navigating back').to.be.true;
  });

  it('Checking redirection to Send page from token details', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    await portfolioPage.clickFirstAsset();
    const portfolioDetailPage = new PortfolioDetailPage(webdriver, logger);
    const detailsVisible = await portfolioDetailPage.isDisplayed();
    expect(detailsVisible, 'Portfolio detail page is not displayed').to.be.true;

    await portfolioDetailPage.clickSendButton();

    const sendSubTab = new SendSubTab(webdriver, logger);
    const sendStepOneDisplayed = await sendSubTab.stepOneIsDisplayed();
    expect(sendStepOneDisplayed, 'Should be redirected to Send page').to.be.true;
  });

  it('Checking redirection to Receive page from token details', async function () {
    const walletTab = new WalletTab(webdriver, logger);
    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    const portfolioDetailPage = new PortfolioDetailPage(webdriver, logger);

    // Ensure we are on details
    await walletTab.goToPortfolioTab();
    await portfolioPage.searchForAsset('ADA');
    await portfolioPage.waitForSearchResults();
    await portfolioPage.clickAssetByName('ADA');

    await portfolioDetailPage.clickReceiveButton();

    const receiveSubTab = new ReceiveSubTab(webdriver, logger);
    const receiveDisplayed = await receiveSubTab.isDisplayed();
    expect(receiveDisplayed, 'Should be redirected to Receive page').to.be.true;
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
