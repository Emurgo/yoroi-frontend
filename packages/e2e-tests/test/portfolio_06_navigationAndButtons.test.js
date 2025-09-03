import { expect } from 'chai';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestLogger } from '../utils/utils.js';
import { customAfterEach } from '../utils/customHooks.js';
import { oneMinute, twoSeconds } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import PortfolioMainPage from '../pages/wallet/portfolio/portfolioMain.page.js';
import PortfolioDetailPage from '../pages/wallet/portfolio/portfolioDetail.page.js';
import BasePage from '../pages/basepage.js';
import { pageTitle } from '../helpers/pageTitles.js';

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
    const walletCommon = new WalletCommonBase(webdriver, logger);
    await walletCommon.goToPortfolioTab();
    await walletCommon.sleep(twoSeconds);
   
    

    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    const isDisplayed = await portfolioPage.isDisplayed();
    expect(isDisplayed, 'Portfolio page is not displayed').to.be.true;
  });

  it('Navigate to token details and return to portfolio table', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Ensure ADA is visible
    await portfolioPage.searchForAsset('ADA');
    await portfolioPage.waitForSearchResults();

    // Open details
    await portfolioPage.clickAssetByName('ADA');
    await portfolioPage.waitForNavigationToDetails();

    // Verify details page
    const portfolioDetailPage = new PortfolioDetailPage(webdriver, logger);
    const isDetailPageDisplayed = await portfolioDetailPage.isDisplayed();
    expect(isDetailPageDisplayed, 'Portfolio detail page is not displayed').to.be.true;

    // Navigate back
    await portfolioDetailPage.clickBackButton();
    await portfolioPage.waitForNavigationToPortfolio();

    // Verify we are back on portfolio page
    const isPortfolioDisplayed = await portfolioPage.isDisplayed();
    expect(isPortfolioDisplayed, 'Portfolio table should be displayed after returning').to.be.true;
  });

  it('Verify Send and Receive buttons redirect correctly from token details', async function () {
    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    // Go to details
    await portfolioPage.searchForAsset('ADA');
    await portfolioPage.waitForSearchResults();
    await portfolioPage.clickAssetByName('ADA');
    await portfolioPage.waitForNavigationToDetails();

    const portfolioDetailPage = new PortfolioDetailPage(webdriver, logger);
    const detailsVisible = await portfolioDetailPage.isDisplayed();
    expect(detailsVisible, 'Portfolio detail page is not displayed').to.be.true;

    // Send
    await portfolioDetailPage.clickSendButton();
    await portfolioPage.waitForNavigationToSend();
    
    // Verify we're on Send sub-tab by checking for Send-specific elements
    const sendSubTab = new (await import('../pages/wallet/walletTab/sendSubTab.page.js')).default(webdriver, logger);
    const sendStepOneDisplayed = await sendSubTab.stepOneIsDisplayed();
    expect(sendStepOneDisplayed, 'Should be redirected to Send page').to.be.true;

    // Back to portfolio
    const walletCommon = new WalletCommonBase(webdriver, logger);
    await walletCommon.goToPortfolioTab();
    await walletCommon.sleep(twoSeconds);

    // Open details again for Receive flow
    await portfolioPage.searchForAsset('ADA');
    await portfolioPage.waitForSearchResults();
    await portfolioPage.clickAssetByName('ADA');
    await portfolioPage.waitForNavigationToDetails();

    // Receive
    await portfolioDetailPage.clickReceiveButton();
    await portfolioPage.waitForNavigationToReceive();
    
    // Verify we're on Receive sub-tab by checking for Receive-specific elements
    const receiveSubTab = new (await import('../pages/wallet/walletTab/receiveSubTab.page.js')).default(webdriver, logger);
    const receiveAddressDisplayed = await receiveSubTab.customWaitIsPresented(receiveSubTab.currentAddressToUseTextLocator);
    expect(receiveAddressDisplayed, 'Should be redirected to Receive page').to.be.true;
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
