import { expect } from 'chai';
import { getDriver } from '../../utils/driverBootstrap.js';
import { customAfterEach } from '../../utils/customHooks.js';
import { getTestLogger } from '../../utils/utils.js';
import {
  CARDANO_IS_READY,
  LedgerEmulatorController,
} from '../../helpers/ledgerEmulatorController.js';
import {
  WindowManager,
  extensionTabName,
  ledgerConnectTabName,
} from '../../helpers/windowManager.js';
import BasePage from '../../pages/basepage.js';
import InitialStepsPage from '../../pages/initialSteps.page.js';
import AddNewWallet from '../../pages/addNewWallet.page.js';
import LedgerConnect from '../../pages/ledgerConnect.page.js';
import TransactionsSubTab from '../../pages/wallet/walletTab/walletTransactions.page.js';
import { oneMinute, quarterSecond, threeSeconds } from '../../helpers/timeConstants.js';

describe('Connect Ledger HW wallet', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let ledgerLogger = null;
  let ledgerController = null;
  let wmLogger = null;
  let windowManager = null;

  before(function (done) {
    webdriver = getDriver();
    logger = getTestLogger(this.test.parent.title);
    ledgerLogger = getTestLogger('ledger', this.test.parent.title);
    ledgerController = new LedgerEmulatorController(ledgerLogger);
    wmLogger = getTestLogger('windowManager', this.test.parent.title);
    windowManager = new WindowManager(webdriver, wmLogger);
    const basePage = new BasePage(webdriver, logger);
    basePage.goToExtension();
    done();
  });

  it('Initials steps', async function () {
    await windowManager.init();
    const initialStepsPage = new InitialStepsPage(webdriver, logger);
    await initialStepsPage.skipInitialSteps();
  });

  it('Ledger is ready', async function () {
    const ledgerState = await ledgerController.readScreen();
    expect(ledgerState, 'Cardano app is not ready').to.equal(CARDANO_IS_READY);
  });

  it('Selecting Connect HW wallet', async function () {
    const addNewWalletPage = new AddNewWallet(webdriver, logger);
    await addNewWalletPage.selectConnectHW();
    await addNewWalletPage.selectLedgerHW();
    await addNewWalletPage.confirmChecking();
    await addNewWalletPage.connectHardwareWallet();
  });

  it('Approve connection', async function () {
    await windowManager.findNewWindowAndSwitchTo(ledgerConnectTabName);
    const ledgerConnectPage = new LedgerConnect(webdriver, logger);
    await ledgerConnectPage.selectNanoS();
    const ledgerIsReady = await ledgerController.isReadyForAction(threeSeconds, quarterSecond);
    expect(ledgerIsReady, `Ledger isn't ready after ${threeSeconds / 1000} seconds`).to.be.true;
    await ledgerController.clickBoth();
    await windowManager.waitForClosingAndSwitchTo(ledgerConnectTabName, extensionTabName);
  });

  it('Enter wallet details', async function () {
    const addNewWalletPage = new AddNewWallet(webdriver, logger);
    await addNewWalletPage.enterHWWalletName('Speculos');
    await addNewWalletPage.saveHWInfo();
  });

  it('Check new wallet', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.waitPrepareWalletBannerIsClosed();
    await transactionsPage.closeUpdatesModalWindow();
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    const walletInfo = await transactionsPage.getSelectedWalletInfo();
    expect(walletInfo.balance, 'The wallet balance is different').to.equal(0);
    expect(walletInfo.name, `The wallet name should be Speculos.`).to.equal('Speculos');
    expect(walletInfo.plate, `The wallet plate should be PAXX-9560`).to.equal('PAXX-9560');
  });

  afterEach(function (done) {
    customAfterEach(this, webdriver, logger);
    done();
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
