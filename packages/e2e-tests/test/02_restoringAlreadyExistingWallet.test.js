import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import AddNewWallet from '../pages/addNewWallet.page.js';
import RestoreWalletStepOne from '../pages/newWalletPages/restoreWalletSteps/restoreWalletStepOne.page.js';
import RestoreWalletStepTwo from '../pages/newWalletPages/restoreWalletSteps/restoreWalletStepTwo.page.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1 } from '../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { restoreWallet } from '../helpers/restoreWalletHelper.js';
import driversPoolsManager from '../utils/driversPool.js';

describe('Restoring already existing wallet', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(function () {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
  });

  it('Restore a 15-word wallet', async function () {
    await restoreWallet(webdriver, logger, testWallet1);
  });

  // Restoring the same wallet again
  it('Start adding new wallet', async function () {
    const walletCommonBasePage = new WalletCommonBase(webdriver, logger);
    await walletCommonBasePage.addNewWallet();
  });

  it('Selecting Restore wallet 15-word', async function () {
    const addNewWalletPage = new AddNewWallet(webdriver, logger);
    await addNewWalletPage.selectRestoreWallet();
    const restoreWalletStepOnePage = new RestoreWalletStepOne(webdriver, logger);
    await restoreWalletStepOnePage.selectFifteenWordWallet();
  });

  it('Enter the wallet seed phrase', async function () {
    const restoreWalletStepTwoPage = new RestoreWalletStepTwo(webdriver, logger);
    await restoreWalletStepTwoPage.enterRecoveryPhrase15Words(testWallet1.mnemonic);
    await restoreWalletStepTwoPage.sleep(100);
    const phraseIsVerified = await restoreWalletStepTwoPage.recoveryPhraseIsVerified();
    expect(phraseIsVerified, 'The recovery phrase is not verified').to.be.true;
  });

  it('Check duplicated info', async function () {
    const restoreWalletStepTwoPage = new RestoreWalletStepTwo(webdriver, logger);
    // the window is displayed
    const duplicatedWindowIsDisplayed =
      await restoreWalletStepTwoPage.duplicatedWalletDialogIsDisplayed();
    expect(duplicatedWindowIsDisplayed, 'The duplicated wallet dialog is not displayed').to.be.true;
    // the wallet name is correct
    const duplicatedWalletName = await restoreWalletStepTwoPage.getDuplicatedWalletName();
    expect(duplicatedWalletName, 'The duplicated wallet name is different').to.equal(
      testWallet1.name
    );
    // the wallet plate is correct
    const duplicatedWalletPlate = await restoreWalletStepTwoPage.getDuplicatedWalletPlate();
    expect(duplicatedWalletPlate, 'The duplicated wallet plate is different').to.equal(
      testWallet1.plate
    );
    // the balance is correct
    const duplicatedWalletBalance = await restoreWalletStepTwoPage.getDuplicatedWalletBalance();
    expect(duplicatedWalletBalance, 'The duplicated wallet balance is different').to.equal(
      testWallet1.balance
    );
  });

  it('Check opening existing wallet', async function () {
    const restoreWalletStepTwoPage = new RestoreWalletStepTwo(webdriver, logger);
    await restoreWalletStepTwoPage.openExistingWallet();
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    const walletInfo = await transactionsPage.getSelectedWalletInfo();
    expect(walletInfo.balance, 'The wallet balance is different').to.equal(testWallet1.balance);
    expect(walletInfo.name, `The wallet name should be "${testWallet1.name}"`).to.equal(
      testWallet1.name
    );
    expect(walletInfo.plate, `The wallet plate should be "${testWallet1.plate}"`).to.equal(
      testWallet1.plate
    );
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
