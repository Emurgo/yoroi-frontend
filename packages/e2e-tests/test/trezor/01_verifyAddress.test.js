import { expect } from 'chai';
import { customAfterEach } from '../../utils/customHooks.js';
import { getTestLogger } from '../../utils/utils.js';
import { TrezorEmulatorController } from '../../helpers/trezorEmulatorController.js';
import {
  convertExportResponse,
  getStakeBeck32KeyFromKeyHash,
  runAndPrepareTrezor,
  TrezorModels,
} from '../../helpers/trezorHelper.js';
import {
  WindowManager,
  extensionTabName,
  trezorConnectTabName,
} from '../../helpers/windowManager.js';
import { testWalletTrezor } from '../../utils/testWallets.js';
import BasePage from '../../pages/basepage.js';
import AddNewWallet from '../../pages/addNewWallet.page.js';
import TrezorConnect from '../../pages/trezorConnect.page.js';
import TransactionsSubTab from '../../pages/wallet/walletTab/walletTransactions.page.js';
import ReceiveSubTab from '../../pages/wallet/walletTab/receiveSubTab.page.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import driversPoolsManager from '../../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { preloadBrowserStorage } from '../../helpers/restoreWalletHelper.js';

for (const model in TrezorModels) {
  const modelName = TrezorModels[model];

  describe(`Verify address on Trezor ${model}`, function () {
    this.timeout(2 * oneMinute);
    /** @type {WebDriver} */
    let webdriver = null;
    /** @type {Logger} */
    let logger = null;
    /** @type {TrezorEmulatorController} */
    let trezorController = null;
    /** @type {WindowManager} */
    let windowManager = null;

    before(async function () {
      webdriver = await driversPoolsManager.getDriverFromPool();
      logger = getTestLogger(this.test.parent.title);
      const trezorLogger = getTestLogger('trezor', this.test.parent.title);
      trezorController = new TrezorEmulatorController(trezorLogger);
      const wmLogger = getTestLogger('windowManager', this.test.parent.title);
      windowManager = new WindowManager(webdriver, wmLogger);
      await windowManager.init();
      await preloadBrowserStorage(webdriver, logger, null, true, {
        'test-CURRENT_NETWORK_ID': '0',
      });
    });

    it('Trezor initialization', async function () {
      await runAndPrepareTrezor(trezorController, testWalletTrezor.mnemonic, modelName);
    });

    it('Selecting Connect HW wallet', async function () {
      const addNewWalletPage = new AddNewWallet(webdriver, logger);
      await addNewWalletPage.selectConnectHW();
      await addNewWalletPage.selectTrezorHW();
      await addNewWalletPage.confirmChecking();
      await addNewWalletPage.connectHardwareWallet();
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

    it('Wait the wallet is loaded', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      await transactionsPage.waitPrepareWalletBannerIsClosed();
      const txPageIsDisplayed = await transactionsPage.isDisplayed();
      expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    });

    it('Go to the Receive tab', async function () {
      const transactionsPage = new TransactionsSubTab(webdriver, logger);
      await transactionsPage.goToReceiveSubMenu();
      const receivePage = new ReceiveSubTab(webdriver, logger);
      await receivePage.selectBaseExtAllAddrs();
      const extAddrsAmount = await receivePage.getAmountOfAddresses();
      expect(extAddrsAmount, 'A wrong amount of external addresses').to.be.at.least(1);
    });

    it('Verify address', async function () {
      const receivePage = new ReceiveSubTab(webdriver, logger);
      const verifyAddressModal = await receivePage.callVerifyAddress(0);
      const verifyModalIsDisplayed = await verifyAddressModal.isDisplayed();
      expect(verifyModalIsDisplayed, 'The Verify Address modal is not displayed').to.be.true;
      // save address from verify address modal
      const verifyModalInfo = await verifyAddressModal.getVerifyAddressInfo();
      // call verification on HW
      await verifyAddressModal.clickVerifyOnHWW();
      await windowManager.findNewWindowAndSwitchTo(trezorConnectTabName);
      // trezor page is displayed
      const trezorExportPage = new TrezorConnect(webdriver, logger);
      const exportPageIsDisplayed = await trezorExportPage.exportAddressPageIsDisplayed();
      expect(exportPageIsDisplayed, 'The Trezor Export Address page is not displayed').to.be.true;
      await trezorExportPage.confirmExportAddress();
      const trezorScreensContent = await trezorController.fullConfirmAndGetContent();
      await windowManager.waitForClosingAndSwitchTo(trezorConnectTabName, extensionTabName);

      const trezorContentCleaned = convertExportResponse(trezorScreensContent);
      const convertedStakeKeyAddress = getStakeBeck32KeyFromKeyHash(verifyModalInfo.stakingKeyHash);
      expect(trezorContentCleaned.addressFull, 'Receive address is different').to.equal(
        verifyModalInfo.addressFull
      );
      expect(trezorContentCleaned.derivationPath, 'Derivation path is different').to.equal(
        verifyModalInfo.derivationPath
      );
      expect(trezorContentCleaned.stakingKeyHash, 'Stakey key is different').to.equal(
        convertedStakeKeyAddress
      );
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
}
