import { customAfterEach } from '../../../utils/customHooks.js';
import AddNewWallet from '../../../pages/addNewWallet.page.js';
import RestoreWalletStepOne from '../../../pages/newWalletPages/restoreWalletSteps/restoreWalletStepOne.page.js';
import RestoreWalletStepTwo from '../../../pages/newWalletPages/restoreWalletSteps/restoreWalletStepTwo.page.js';
import WalletDetails from '../../../pages/newWalletPages/walletDetails.page.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1, testWallet2 } from '../../../utils/testWallets.js';
import { getPassword } from '../../../helpers/constants.js';
import { expect } from 'chai';
import { getTestLogger, walletNameShortener } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { preloadBrowserStorage } from '../../../helpers/restoreWalletHelper.js';

describe('Restoring 15-wallet, clear input and restore other 15-wallet', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {AddNewWallet} */
  let addNewWalletPage = null;
  /** @type {RestoreWalletStepOne} */
  let restoreWalletStepOnePage = null;
  /** @type {RestoreWalletStepTwo} */
  let restoreWalletStepTwoPage = null;
  /** @type {WalletDetails} */
  let walletDetailsPage = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await preloadBrowserStorage(webdriver, logger);
    addNewWalletPage = new AddNewWallet(webdriver, logger);
    restoreWalletStepOnePage = new RestoreWalletStepOne(webdriver, logger);
    restoreWalletStepTwoPage = new RestoreWalletStepTwo(webdriver, logger);
    walletDetailsPage = new WalletDetails(webdriver, logger);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
  });

  it('Selecting Restore wallet 15-word', async function () {
    await addNewWalletPage.selectRestoreWallet();
    const restoreWalletStepOnePage = new RestoreWalletStepOne(webdriver, logger);
    await restoreWalletStepOnePage.selectFifteenWordWallet();
  });

  it('Enter the wallet seed phrase of first wallet', async function () {
    await restoreWalletStepTwoPage.enterRecoveryPhrase15Words(testWallet1.mnemonic);
    await restoreWalletStepTwoPage.sleep(100);
    const phraseIsVerified = await restoreWalletStepTwoPage.recoveryPhraseIsVerified();
    expect(phraseIsVerified, 'The recovery phrase is not verified').to.be.true;
    await restoreWalletStepTwoPage.continue();
  });

  it('Check the wallet plate of the first wallet', async function () {
    await walletDetailsPage.closeTipsModalWindow();
    const walletPlate = await walletDetailsPage.getWalletPlate();
    expect(walletPlate, 'Wallet plate is different from expected').to.equal(testWallet1.plate);
  });

  it('Back to the previous step and clear all inputs', async function () {
    await walletDetailsPage.backOnPreviousStep();
    await restoreWalletStepTwoPage.clearAllInputsManually();

    const inputsAreEmpty = await restoreWalletStepTwoPage.allInputsAreEmpty();
    expect(inputsAreEmpty, 'Seed phrase inputs are not empty').to.be.true;
  });

  it('Enter the wallet seed phrase of second wallet', async function () {
    await restoreWalletStepTwoPage.enterRecoveryPhrase15Words(testWallet2.mnemonic);
    const phraseIsVerified = await restoreWalletStepTwoPage.recoveryPhraseIsVerified();
    expect(phraseIsVerified, 'The recovery phrase is not verified').to.be.true;
    await restoreWalletStepTwoPage.continue();
  });

  it('Enter wallet details', async function () {
    const walletPassword = getPassword();
    await walletDetailsPage.enterWalletName(testWallet2.name);
    await walletDetailsPage.enterWalletPassword(walletPassword);
    await walletDetailsPage.repeatWalletPassword(walletPassword);

    const walletPlate = await walletDetailsPage.getWalletPlate();
    expect(walletPlate, 'Wallet plate is different from expected').to.equal(testWallet2.plate);

    await walletDetailsPage.saveToLocalStorage('walletName', testWallet2.name);
    await walletDetailsPage.saveToLocalStorage('walletPlate', walletPlate);

    const noWalletNameErrors = await walletDetailsPage.checkWalletNameHasNoError();
    expect(noWalletNameErrors, 'The wallet name has an error').to.be.true;
    const noWalletPasswordError = await walletDetailsPage.checkWalletPaswordHasNoError();
    expect(noWalletPasswordError, 'The wallet password has an error').to.be.true;
    const noWalletRepeatPasswordError = await walletDetailsPage.checkWalletRepeatPasswordHasNoError();
    expect(noWalletRepeatPasswordError, 'The wallet repeat password has an error').to.be.true;
    await walletDetailsPage.continue();
  });

  it('Check new wallet', async function () {
    await transactionsPage.waitPrepareWalletBannerIsClosed();
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    const walletInfo = await transactionsPage.getSelectedWalletInfo();
    expect(walletInfo.balance, 'The wallet balance is different').to.equal(testWallet2.balance);
    const expWalletName = await transactionsPage.getFromLocalStorage('walletName');
    const shortenedWalletName = walletNameShortener(expWalletName);
    const expWalletPlate = await transactionsPage.getFromLocalStorage('walletPlate');
    expect(walletInfo.name, `The wallet name should be "${expWalletName}"`).to.equal(shortenedWalletName);
    expect(walletInfo.plate, `The wallet plate should be "${expWalletPlate}"`).to.equal(expWalletPlate);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
