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
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';

describe('Cashback Tests - Two Wallets Added', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Verify that wallet switching works on cashback page', async function () {
    // Add a new wallet
    const walletBase = new WalletCommonBase(webdriver, logger);
    await walletBase.addNewWallet();
    const addNewWalletPage = new AddNewWallet(webdriver, logger);
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

    // Verify the wallet was created successfully
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed).to.be.true;
    
    await walletBase.goToSettingsTab();
    await walletBase.sleep(twoSeconds);
    
    // Set the first wallet as cashback wallet
    const generalSettings = new GeneralSubTab(webdriver, logger);
    await generalSettings.selectCashbackWallet('TestWallet1');
    await walletBase.sleep(twoSeconds);
    
    // Verify that first wallet is now set as cashback wallet
    const firstWalletIsCashback = await generalSettings.verifyCashbackWalletIsSelected('TestWallet1');
    expect(firstWalletIsCashback, 'First wallet should be set as cashback wallet').to.be.true;
    await walletBase.sleep(twoSeconds);
    
      
        logger.info('Navigating to cashback tab');
        await walletBase.goToCashbackTab();
        await walletBase.sleep(twoSeconds);
        const termsModal = new CashbackTermsModal(webdriver, logger);
        await termsModal.acceptDisclaimerAndProceed();
        
    
    const cashbackPage = new CashbackPage(webdriver, logger);
    const modalDisplayed = await cashbackPage.isWrongWalletModalDisplayed();
    expect(modalDisplayed, 'Wrong wallet modal should be displayed').to.be.true;
    
    // Set the current selected wallet as the cashback wallet
    logger.info('Setting current wallet as cashback wallet');
    await cashbackPage.clickSetThisWallet();
    await walletBase.sleep(twoSeconds);
    
    // Verify modal is closed
    const modalStillDisplayed = await cashbackPage.isWrongWalletModalDisplayed();
    expect(modalStillDisplayed, 'Modal should be closed after setting wallet').to.be.false;
    
  
    await walletBase.goToSettingsTab();
    await walletBase.sleep(twoSeconds);
      // Check that the second wallet is set as the cashback wallet
    const secondWalletIsCashback = await generalSettings.verifyCashbackWalletIsSelected('CashbackTest');
    expect(secondWalletIsCashback, 'Second wallet should now be set as cashback wallet').to.be.true;
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