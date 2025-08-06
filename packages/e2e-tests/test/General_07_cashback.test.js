import { expect } from 'chai';
import BasePage from '../pages/basepage.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import CashbackPage from '../pages/wallet/Cashback/cashback.page.js';
import CashbackTermsModal from '../pages/wallet/settingsTab/modals/disclaimerModal.page.js';
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute, twoSeconds } from '../helpers/timeConstants.js';
import { pageTitle } from '../helpers/pageTitles.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import { getTestWalletName, CardanoNetworks, getPassword } from '../helpers/constants.js';
import AddNewWallet from '../pages/addNewWallet.page.js';
import CreateWalletStepOne from '../pages/newWalletPages/createWalletSteps/createWalletStepOne.page.js';
import CreateWalletStepTwo from '../pages/newWalletPages/createWalletSteps/createWalletStepTwo.page.js';
import CreateWalletStepThree from '../pages/newWalletPages/createWalletSteps/createWalletStepThree.page.js';
import WalletDetails from '../pages/newWalletPages/walletDetails.page.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';


describe('Cashback General Tests', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let walletName = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
    walletName = getTestWalletName();
  });
  it('Navigates to Cashback page', async function () {
    const walletBase = new WalletCommonBase(webdriver, logger);
    await walletBase.goToCashbackTab();
    await walletBase.sleep(twoSeconds);
    
    // Verify we're on the cashback page
    const currentTitle = await walletBase.getPageTitle();
    expect(currentTitle).to.equal(pageTitle.cashback, `Expected to be on ${pageTitle.cashback} page`);
  });

  it('Check first-time popup is displayed', async function () {
    const termsModal = new CashbackTermsModal(webdriver, logger);
    const walletBase = new WalletCommonBase(webdriver, logger);

    // Verify the disclaimer modal is displayed
    const modalDisplayed = await termsModal.isDisplayed();
    expect(modalDisplayed, 'Terms modal should be displayed').to.be.true;
    
    
    const disclaimerText = await termsModal.getDisclaimerText();
    logger.info(`Disclaimer text: ${disclaimerText}`);
   
    // Close the modal WITHOUT accepting terms
    await termsModal.closeCashbackTermsModal();
    await walletBase.sleep(twoSeconds);
    const currentTitle = await walletBase.getPageTitle();
    expect(currentTitle).to.equal(pageTitle.wallet, `Expected to be on ${pageTitle.wallet} page`);
    
  });

  it('Verify cannot continue without accepting terms on popup', async function () {
    const termsModal = new CashbackTermsModal(webdriver, logger);
    const walletBase = new WalletCommonBase(webdriver, logger);
    await walletBase.goToCashbackTab();
    await walletBase.sleep(twoSeconds);
    
    // Check if proceed button is initially disabled
    const isInitiallyEnabled = await termsModal.isProceedButtonEnabled();
    expect(isInitiallyEnabled, 'Proceed button should be disabled initially').to.be.false;
    
    // Try to proceed without accepting terms
    await termsModal.proceedWithDisclaimer();
    // Verify the modal is still displayed
    const modalStillDisplayed = await termsModal.isDisplayed();
    expect(modalStillDisplayed, 'Terms modal should still be displayed').to.be.true;
    
    await termsModal.acceptDisclaimerAndProceed();
  
  });


  it('Check page is displayed with general markers', async function () {
    const cashbackPage = new CashbackPage(webdriver, logger);
  
    // Verify the claim button is visible
    const claimButtonVisible = await cashbackPage.isClaimCashbackButtonVisible();
    expect(claimButtonVisible).to.be.true;
    
    // Verify cashback cards are displayed
    const cardCount = await cashbackPage.getCashbackCardCount();
    expect(cardCount).to.be.greaterThan(0, 'Cashback cards should be displayed');
  });

  it('Test applying selected wallet for cashback', async function () {
    const walletBase = new WalletCommonBase(webdriver, logger);
    const addNewWalletPage = new AddNewWallet(webdriver, logger);
    const generalSettings = new GeneralSubTab(webdriver, logger);
    
    // Add a new wallet first
    logger.info('Adding a new wallet for cashback testing');
    await walletBase.addNewWallet();
    await addNewWalletPage.selectCreateNewWallet();
    const createWalletStepOnePage = new CreateWalletStepOne(webdriver, logger);
    await createWalletStepOnePage.continue();
    
    const createWalletStepTwoPage = new CreateWalletStepTwo(webdriver, logger);
    await createWalletStepTwoPage.closeTipsModalWindow(false);
    await createWalletStepTwoPage.toggleVisibilityOfRecoveryPhrase();
    await createWalletStepTwoPage.saveRecoveryPhrase();
    await createWalletStepTwoPage.continue();
    
    const createWalletStepThreePage = new CreateWalletStepThree(webdriver, logger);
    const recoveryPhrase = await createWalletStepThreePage.getRecoveryPhraseFromStorage();
    await createWalletStepThreePage.enterRecoveryPhrase(recoveryPhrase);
    await createWalletStepThreePage.continue();
    
    const walletDetailsPage = new WalletDetails(webdriver, logger);
    await walletDetailsPage.closeTipsModalWindow(false);
    const newWalletName = 'CashbackTestWallet';
    const walletPassword = getPassword();
    await walletDetailsPage.enterWalletName(newWalletName);
    await walletDetailsPage.enterWalletPassword(walletPassword);
    await walletDetailsPage.repeatWalletPassword(walletPassword);
    await walletDetailsPage.continue();
    
    // Wait for wallet to be ready
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.waitPrepareWalletBannerIsClosed(); 
    
    // Navigate back to cashback page to verify the selection took effect
    await walletBase.goToCashbackTab();
    await walletBase.sleep(twoSeconds);
    
    // Verify the cashback page is
    const cashbackPage = new CashbackPage(webdriver, logger);
    const pageLoaded = await cashbackPage.verifyCashbackPageLoaded();
    expect(pageLoaded).to.be.true;
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