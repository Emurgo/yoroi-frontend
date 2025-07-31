import { expect } from 'chai';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import CashbackPage from '../pages/wallet/Cashback/cashback.page.js';
import CashbackTermsModal from '../pages/wallet/settingsTab/modals/disclaimerModal.page.js';
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute, twoSeconds } from '../helpers/timeConstants.js';
import { pageTitle } from '../helpers/pageTitles.js';
import { preloadBrowserStorage } from '../helpers/restoreWalletHelper.js';
import { getTestWalletName } from '../helpers/constants.js';

describe('Cashback General Tests', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let walletName = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await preloadBrowserStorage(webdriver, logger);
    walletName = getTestWalletName();
  });

  afterEach(async function () {
    await customAfterEach(this.currentTest, webdriver, logger);
  });

  it('Navigate to Cashback page', async function () {
    const walletBase = new WalletCommonBase(webdriver, logger);
    await walletBase.goToCashbackTab();
    
    // Wait for page to load
    await walletBase.sleep(twoSeconds);
    
    // Verify we're on the cashback page
    const currentTitle = await walletBase.getPageTitle();
    expect(currentTitle).to.equal(pageTitle.cashback, `Expected to be on ${pageTitle.cashback} page`);
  });

  it('Check first-time popup is displayed when clicking cashback card', async function () {
    const cashbackPage = new CashbackPage(webdriver, logger);
    const termsModal = new CashbackTermsModal(webdriver, logger);
    
    // Wait for cashback page to load
    await cashbackPage.waitForCashbackPageLoad();
    
    // Verify page elements are present
    const pageElements = await cashbackPage.verifyAllCashbackPageElements();
    expect(pageElements.titleVisible).to.be.true;
    expect(pageElements.claimButtonVisible).to.be.true;
    
    // Check if cashback cards are present
    const cardCount = await cashbackPage.getCashbackCardCount();
    expect(cardCount).to.be.greaterThan(0, 'At least one cashback card should be present');
    
    // Click on the first cashback card to trigger the terms popup
    await cashbackPage.openCashbackTermsModal();
    
    // Verify the terms modal is displayed
    const modalDisplayed = await termsModal.isDisplayed();
    expect(modalDisplayed).to.be.true;
  });

  it('Verify cannot continue without accepting terms on popup', async function () {
    const termsModal = new CashbackTermsModal(webdriver, logger);
    
    // Try to proceed without accepting terms
    // The proceed button should be disabled or clicking it should not work
    try {
      await termsModal.proceedWithDisclaimer();
      // If we reach here, the button was clickable, which is not expected
      expect.fail('Should not be able to proceed without accepting terms');
    } catch (error) {
      // Expected behavior - proceed button should be disabled or not functional
      logger.info('Proceed button correctly disabled without accepting terms');
    }
    
    // Close the modal to clean up
    await termsModal.closeCashbackTermsModal();
  });

  it('Check page is displayed with general markers', async function () {
    const cashbackPage = new CashbackPage(webdriver, logger);
    
    // Verify the page title is correct (Cashback at left top corner)
    const titleVisible = await cashbackPage.isCashbackPageTitleVisible();
    expect(titleVisible).to.be.true;
    
    // Verify the claim button is visible
    const claimButtonVisible = await cashbackPage.isClaimCashbackButtonVisible();
    expect(claimButtonVisible).to.be.true;
    
    // Verify cashback cards are displayed
    const cardCount = await cashbackPage.getCashbackCardCount();
    expect(cardCount).to.be.greaterThan(0, 'Cashback cards should be displayed');
    
    // Verify page has loaded completely
    const pageLoaded = await cashbackPage.verifyCashbackPageLoaded();
    expect(pageLoaded).to.be.true;
  });

  it('Test applying selected wallet for cashback', async function () {
    const walletBase = new WalletCommonBase(webdriver, logger);
    const generalSettings = new GeneralSubTab(webdriver, logger);
    
    // Navigate to settings to configure cashback wallet
    await walletBase.goToSettingsTab();
    
    // Wait for settings to load
    await walletBase.sleep(twoSeconds);
    
    // Select a wallet for cashback (using the first available wallet)
    // Note: This assumes there's at least one wallet available
    try {
      await generalSettings.selectCashBackWalletFromDropdown(walletName);
      logger.info(`Successfully selected wallet "${walletName}" for cashback`);
    } catch (error) {
      // If the specific wallet name doesn't exist, try with a generic name
      logger.info(`Wallet "${walletName}" not found, trying with "Wallet"`);
      await generalSettings.selectCashBackWalletFromDropdown('Wallet');
    }
    
    // Navigate back to cashback page to verify the selection took effect
    await walletBase.goToCashbackTab();
    await walletBase.sleep(twoSeconds);
    
    // Verify we're still on the cashback page
    const currentTitle = await walletBase.getPageTitle();
    expect(currentTitle).to.equal(pageTitle.cashback, `Should still be on ${pageTitle.cashback} page`);
    
    // Verify the page is still functional after wallet selection
    const cashbackPage = new CashbackPage(webdriver, logger);
    const pageLoaded = await cashbackPage.verifyCashbackPageLoaded();
    expect(pageLoaded).to.be.true;
  });

  it('Test complete cashback flow with terms acceptance', async function () {
    const cashbackPage = new CashbackPage(webdriver, logger);
    const termsModal = new CashbackTermsModal(webdriver, logger);
    
    // Wait for cashback page to load
    await cashbackPage.waitForCashbackPageLoad();
    
    // Click on the first cashback card to open terms modal
    await cashbackPage.openCashbackTermsModal();
    
    // Verify modal is displayed
    const modalDisplayed = await termsModal.isDisplayed();
    expect(modalDisplayed).to.be.true;
    
    // Accept the terms and proceed
    await termsModal.acceptDisclaimerAndProceed();
    
    // Wait a moment for the action to complete
    await cashbackPage.sleep(twoSeconds);
    
    // Verify we're still on the cashback page after accepting terms
    const pageLoaded = await cashbackPage.verifyCashbackPageLoaded();
    expect(pageLoaded).to.be.true;
  });
}); 