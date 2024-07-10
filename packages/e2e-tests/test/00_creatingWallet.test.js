import { expect } from 'chai';
import BasePage from '../pages/basepage.js';
import AddNewWallet from '../pages/addNewWallet.page.js';
import CreateWalletStepOne from '../pages/newWalletPages/createWalletSteps/createWalletStepOne.page.js';
import CreateWalletStepTwo from '../pages/newWalletPages/createWalletSteps/createWalletStepTwo.page.js';
import CreateWalletStepThree from '../pages/newWalletPages/createWalletSteps/createWalletStepThree.page.js';
import WalletDetails from '../pages/newWalletPages/walletDetails.page.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import { getPassword, getTestWalletName } from '../helpers/constants.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import StakingTab from '../pages/wallet/stakingTab/stakingTab.page.js';

describe('Creating wallet', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
  });

  it('Selecting Create wallet', async function () {
    const addNewWalletPage = new AddNewWallet(webdriver, logger);
    await addNewWalletPage.selectCreateNewWallet();
  });

  it('Remember a seed phrase', async function () {
    const createWalletStepOnePage = new CreateWalletStepOne(webdriver, logger);
    await createWalletStepOnePage.continue();
    const createWalletStepTwoPage = new CreateWalletStepTwo(webdriver, logger);
    await createWalletStepTwoPage.closeTipsModalWindow();
    const allWordsBlurredBefore = await createWalletStepTwoPage.recoveryPhraseIsBlurred();
    expect(allWordsBlurredBefore).to.true;
    await createWalletStepTwoPage.toggleVisibilityOfRecoveryPhrase();
    const allWordsBlurredAfter = await createWalletStepTwoPage.recoveryPhraseIsBlurred();
    expect(allWordsBlurredAfter).to.false;
    await createWalletStepTwoPage.saveRecoveryPhrase();
    await createWalletStepTwoPage.continue();
  });

  it('Repeat the seed phrase', async function () {
    const createWalletStepThreePage = new CreateWalletStepThree(webdriver, logger);
    const recoveryPhrase = await createWalletStepThreePage.getRecoveryPhraseFromStorage();
    await createWalletStepThreePage.enterRecoveryPhrase(recoveryPhrase);
    const phraseIsValid = await createWalletStepThreePage.recoveryPhraseIsValid();
    expect(phraseIsValid, 'Phrase is not valid').to.true;
    await createWalletStepThreePage.continue();
  });

  it('Enter wallet details', async function () {
    const walletDetailsPage = new WalletDetails(webdriver, logger);
    // close info dialog
    await walletDetailsPage.closeTipsModalWindow();
    // enter wallet details
    const walletName = getTestWalletName();
    const walletPassword = getPassword();
    await walletDetailsPage.enterWalletName(walletName);
    await walletDetailsPage.enterWalletPassword(walletPassword);
    await walletDetailsPage.repeatWalletPassword(walletPassword);

    await walletDetailsPage.saveToLocalStorage('walletName', walletName);
    const walletPlate = await walletDetailsPage.getWalletPlate();
    await walletDetailsPage.saveToLocalStorage('walletPlate', walletPlate);

    const noWalletNameErrors = await walletDetailsPage.checkWalletNameHasNoError();
    expect(noWalletNameErrors, 'The wallet name has an error').to.be.true;
    const noWalletPasswordError = await walletDetailsPage.checkWalletPaswordHasNoError();
    expect(noWalletPasswordError, 'The wallet password has an error').to.be.true;
    const noWalletRepeatPasswordError =
      await walletDetailsPage.checkWalletRepeatPasswordHasNoError();
    expect(noWalletRepeatPasswordError, 'The wallet repeat password has an error').to.be.true;
    await walletDetailsPage.continue();
  });

  it('Check new wallet info', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.waitPrepareWalletBannerIsClosed();
    await transactionsPage.closeUpdatesModalWindow();
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed).to.be.true;
    const walletInfo = await transactionsPage.getSelectedWalletInfo();
    expect(walletInfo.balance, 'The wallet balance should be 0 (zero)').to.equal(0);
    const expWalletName = await transactionsPage.getFromLocalStorage('walletName');
    const expWalletPlate = await transactionsPage.getFromLocalStorage('walletPlate');
    expect(walletInfo.name, `The wallet name should be "${expWalletName}"`).to.equal(expWalletName);
    expect(walletInfo.plate, `The wallet plate should be "${expWalletPlate}"`).to.equal(
      expWalletPlate
    );
  });

  // check amount of transactions
  it('Check the wallet is empty', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txsAmount = await transactionsPage.walletIsEmpty();
    expect(txsAmount, 'A new wallet is not empty').to.be.true;
  });

  // check amount of addresses (external | internal)

  // check wallet is not delegated
  it('Check wallet is not delegated', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.goToStakingTab();
    const stakingPage = new StakingTab(webdriver, logger);
    const walletIsNotDelegatedState = await stakingPage.walletIsNotDelegated();
    expect(walletIsNotDelegatedState, 'There is no banner "Wallet is not delegated"').to.be.true;
    await transactionsPage.takeScreenshot('STAKING', 'debug');
    await transactionsPage.takeSnapshot('STAKING', 'debug');
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
