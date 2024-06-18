import { expect } from 'chai';
import { getDriver } from '../../utils/driverBootstrap.js';
import { customAfterEach } from '../../utils/customHooks.js';
import { getTestLogger } from '../../utils/utils.js';
import { TrezorEmulatorController } from '../../helpers/trezorEmulatorController.js';
import { runAndPrepareTrezor } from '../../helpers/trezorHelper.js';
import {
  WindowManager,
  extensionTabName,
  trezorConnectTabName,
} from '../../helpers/windowManager.js';
import { testWalletTrezor } from '../../utils/testWallets.js';
import BasePage from '../../pages/basepage.js';
import InitialStepsPage from '../../pages/initialSteps.page.js';
import AddNewWallet from '../../pages/addNewWallet.page.js';
import TrezorConnect from '../../pages/trezorConnect.page.js';
import TransactionsSubTab from '../../pages/wallet/walletTab/walletTransactions.page.js';
import { oneMinute } from '../../helpers/timeConstants.js';

describe('Connect Trezor HW wallet', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let trezorLogger = null;
  let trezorController = null;
  let wmLogger = null;
  let windowManager = null;

  before(function (done) {
    webdriver = getDriver();
    logger = getTestLogger(this.test.parent.title);
    trezorLogger = getTestLogger('trezor', this.test.parent.title);
    trezorController = new TrezorEmulatorController(trezorLogger);
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

  it('Trezor initialization', async function () {
    await runAndPrepareTrezor(trezorController, testWalletTrezor.mnemonic);
  });

  it('Selecting Connect HW wallet', async function () {
    const addNewWalletPage = new AddNewWallet(webdriver, logger);
    await addNewWalletPage.selectConnectHW();
    await addNewWalletPage.selectCardanoNetwork();
    await addNewWalletPage.selectTrezorHW();
    await addNewWalletPage.confirmChecking();
    await addNewWalletPage.connectTrezor();
  });

  it('Approve connection', async function () {
    await windowManager.findNewWindowAndSwitchTo(trezorConnectTabName);
    const trezorConnectPage = new TrezorConnect(webdriver, logger);
    await trezorConnectPage.tickCheckbox();
    await trezorConnectPage.allowConnection();
    await trezorConnectPage.allowPubKeysExport();
    await windowManager.waitForClosingAndSwitchTo(trezorConnectTabName, extensionTabName);
  });

  it('Enter wallet details', async function () {
    const addNewWalletPage = new AddNewWallet(webdriver, logger);
    await addNewWalletPage.enterHWWalletName(testWalletTrezor.name);
    await addNewWalletPage.saveHWInfo();
  });

  it('Check new wallet', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.waitPrepareWalletBannerIsClosed();
    await transactionsPage.closeUpdatesModalWindow();
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    const walletInfo = await transactionsPage.getSelectedWalletInfo();
    expect(walletInfo.walletBalance, 'The wallet balance is different').to.equal(
      testWalletTrezor.balance
    );
    expect(walletInfo.walletName, `The wallet name should be "${testWalletTrezor.name}"`).to.equal(
      testWalletTrezor.name
    );
    expect(
      walletInfo.walletPlate,
      `The wallet plate should be "${testWalletTrezor.plate}"`
    ).to.equal(testWalletTrezor.plate);
  });

  afterEach(function (done) {
    customAfterEach(this, webdriver, logger);
    done();
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
    await trezorController.bridgeStop();
    await trezorController.emulatorStop();
    trezorController.closeWsConnection();
  });
});
