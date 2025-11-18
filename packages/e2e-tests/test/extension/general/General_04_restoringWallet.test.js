import { customAfterEach } from '../../../utils/customHooks.js';
import AddNewWallet from '../../../pages/addNewWallet.page.js';
import RestoreWalletStepOne from '../../../pages/newWalletPages/restoreWalletSteps/restoreWalletStepOne.page.js';
import RestoreWalletStepTwo from '../../../pages/newWalletPages/restoreWalletSteps/restoreWalletStepTwo.page.js';
import WalletDetails from '../../../pages/newWalletPages/walletDetails.page.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1Mainnet } from '../../../utils/testWallets.js';
import { getPassword } from '../../../helpers/constants.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { preloadBrowserStorage } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Restoring 15-wallet _smoke_', function () {
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
    await preloadBrowserStorage(webdriver, logger, null, true, {
      'test-CURRENT_NETWORK_ID': '0',
    });
    addNewWalletPage = new AddNewWallet(webdriver, logger);
    restoreWalletStepOnePage = new RestoreWalletStepOne(webdriver, logger);
    restoreWalletStepTwoPage = new RestoreWalletStepTwo(webdriver, logger);
    walletDetailsPage = new WalletDetails(webdriver, logger);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
  });

  it('Selecting Restore wallet 15-word', async function () {
    await addNewWalletPage.selectRestoreWallet();
    await restoreWalletStepOnePage.selectFifteenWordWallet();
  });

  it('Enter the wallet seed phrase', async function () {
    await restoreWalletStepTwoPage.enterRecoveryPhrase15Words(testWallet1Mainnet.mnemonic);
    await restoreWalletStepTwoPage.sleep(100);
    const phraseIsVerified = await restoreWalletStepTwoPage.recoveryPhraseIsVerified();
    expect(phraseIsVerified, 'The recovery phrase is not verified').to.be.true;
    await restoreWalletStepTwoPage.continue();
  });

  it('Enter wallet details', async function () {
    // close info dialog
    await walletDetailsPage.closeTipsModalWindow();
    // enter wallet details
    const walletPassword = getPassword();
    await walletDetailsPage.enterWalletName(testWallet1Mainnet.name);
    await walletDetailsPage.enterWalletPassword(walletPassword);
    await walletDetailsPage.repeatWalletPassword(walletPassword);

    const walletPlate = await walletDetailsPage.getWalletPlate();
    expect(walletPlate, 'Wallet plate is different from expected').to.equal(testWallet1Mainnet.plate);

    await walletDetailsPage.saveToLocalStorage('walletName', testWallet1Mainnet.name);
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
    expect(walletInfo.balance, 'The wallet balance is different').to.equal(testWallet1Mainnet.balance);
    const expWalletName = await transactionsPage.getFromLocalStorage('walletName');
    const expWalletPlate = await transactionsPage.getFromLocalStorage('walletPlate');
    expect(walletInfo.name, `The wallet name should be "${expWalletName}"`).to.equal(expWalletName);
    expect(walletInfo.plate, `The wallet plate should be "${expWalletPlate}"`).to.equal(expWalletPlate);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
