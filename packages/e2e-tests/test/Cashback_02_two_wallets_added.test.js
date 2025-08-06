import { expect } from 'chai';
import BasePage from '../pages/basepage.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import CashbackPage from '../pages/wallet/Cashback/cashback.page.js';
import CashbackTermsModal from '../pages/wallet/settingsTab/modals/disclaimerModal.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute, twoSeconds } from '../helpers/timeConstants.js';
import { pageTitle } from '../helpers/pageTitles.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import { getPassword } from '../helpers/constants.js';
import AddNewWallet from '../pages/addNewWallet.page.js';
import CreateWalletStepOne from '../pages/newWalletPages/createWalletSteps/createWalletStepOne.page.js';
import CreateWalletStepTwo from '../pages/newWalletPages/createWalletSteps/createWalletStepTwo.page.js';
import CreateWalletStepThree from '../pages/newWalletPages/createWalletSteps/createWalletStepThree.page.js';
import WalletDetails from '../pages/newWalletPages/walletDetails.page.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';

describe('Cashback Tests - Two Wallets Added', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Add second wallet before opening Cashback page', async function () {
    const walletBase = new WalletCommonBase(webdriver, logger);
    const addNewWalletPage = new AddNewWallet(webdriver, logger);
    
    // Add a new wallet first
    logger.info('Adding a second wallet for cashback testing');
    await walletBase.addNewWallet();
    await addNewWalletPage.selectCreateNewWallet();
    const createWalletStepOnePage = new CreateWalletStepOne(webdriver, logger);
    await createWalletStepOnePage.continue();
    
    const createWalletStepTwoPage = new CreateWalletStepTwo(webdriver, logger);
    await createWalletStepTwoPage.toggleVisibilityOfRecoveryPhrase();
    await createWalletStepTwoPage.saveRecoveryPhrase();
    await createWalletStepTwoPage.continue();
    
    const createWalletStepThreePage = new CreateWalletStepThree(webdriver, logger);
    const recoveryPhrase = await createWalletStepThreePage.getRecoveryPhraseFromStorage();
    await createWalletStepThreePage.enterRecoveryPhrase(recoveryPhrase);
    await createWalletStepThreePage.continue();
    
    const walletDetailsPage = new WalletDetails(webdriver, logger);
    const newWalletName = 'CashbackTestWallet';
    const walletPassword = getPassword();
    await walletDetailsPage.enterWalletName(newWalletName);
    await walletDetailsPage.enterWalletPassword(walletPassword);
    await walletDetailsPage.repeatWalletPassword(walletPassword);
    await walletDetailsPage.continue();
    
    // Wait for wallet to be ready
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.waitPrepareWalletBannerIsClosed();
    
    // Verify the second wallet was created successfully
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed).to.be.true;
  });

  it('Navigates to Cashback page with two wallets', async function () {
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