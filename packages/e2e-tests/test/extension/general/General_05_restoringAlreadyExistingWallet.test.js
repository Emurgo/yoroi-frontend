import BasePage from '../../../pages/basepage.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import WalletCommonBase from '../../../pages/walletCommonBase.page.js';
import AddNewWallet from '../../../pages/addNewWallet.page.js';
import RestoreWalletStepOne from '../../../pages/newWalletPages/restoreWalletSteps/restoreWalletStepOne.page.js';
import RestoreWalletStepTwo from '../../../pages/newWalletPages/restoreWalletSteps/restoreWalletStepTwo.page.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1 } from '../../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { restoreWallet } from '../../../helpers/restoreWalletHelper.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Restoring already existing wallet', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {WalletCommonBase} */
  let walletCommonBasePage = null;
  /** @type {AddNewWallet} */
  let addNewWalletPage = null;
  /** @type {RestoreWalletStepOne} */
  let restoreWalletStepOnePage = null;
  /** @type {RestoreWalletStepTwo} */
  let restoreWalletStepTwoPage = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    walletCommonBasePage = new WalletCommonBase(webdriver, logger);
    addNewWalletPage = new AddNewWallet(webdriver, logger);
    restoreWalletStepOnePage = new RestoreWalletStepOne(webdriver, logger);
    restoreWalletStepTwoPage = new RestoreWalletStepTwo(webdriver, logger);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
  });

  it('Restore a 15-word wallet', async function () {
    await restoreWallet(webdriver, logger, testWallet1);
  });

  // Restoring the same wallet again
  it('Start adding new wallet', async function () {
    await walletCommonBasePage.addNewWallet();
  });

  it('Selecting Restore wallet 15-word', async function () {
    await addNewWalletPage.selectRestoreWallet();
    await restoreWalletStepOnePage.selectFifteenWordWallet();
  });

  it('Enter the wallet seed phrase', async function () {
    await restoreWalletStepTwoPage.enterRecoveryPhrase15Words(testWallet1.mnemonic);
    await restoreWalletStepTwoPage.sleep(100);
    const phraseIsVerified = await restoreWalletStepTwoPage.recoveryPhraseIsVerified();
    expect(phraseIsVerified, 'The recovery phrase is not verified').to.be.true;
  });

  it('Check duplicated info', async function () {
    // the window is displayed
    const duplicatedWindowIsDisplayed = await restoreWalletStepTwoPage.duplicatedWalletDialogIsDisplayed();
    expect(duplicatedWindowIsDisplayed, 'The duplicated wallet dialog is not displayed').to.be.true;
    // the wallet name is correct
    const duplicatedWalletName = await restoreWalletStepTwoPage.getDuplicatedWalletName();
    expect(duplicatedWalletName, 'The duplicated wallet name is different').to.equal(testWallet1.name);
    // the wallet plate is correct
    const duplicatedWalletPlate = await restoreWalletStepTwoPage.getDuplicatedWalletPlate();
    expect(duplicatedWalletPlate, 'The duplicated wallet plate is different').to.equal(testWallet1.plate);
    // the balance is correct
    const duplicatedWalletBalance = await restoreWalletStepTwoPage.getDuplicatedWalletBalance();
    expect(duplicatedWalletBalance, 'The duplicated wallet balance is different').to.equal(testWallet1.balance);
  });

  it('Check opening existing wallet', async function () {
    await restoreWalletStepTwoPage.openExistingWallet();
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    const walletInfo = await transactionsPage.getSelectedWalletInfo();
    expect(walletInfo.balance, 'The wallet balance is different').to.equal(testWallet1.balance);
    expect(walletInfo.name, `The wallet name should be "${testWallet1.name}"`).to.equal(testWallet1.name);
    expect(walletInfo.plate, `The wallet plate should be "${testWallet1.plate}"`).to.equal(testWallet1.plate);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
