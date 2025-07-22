import { expect } from 'chai';
import { customAfterEach } from '../../utils/customHooks.js';
import { getTestLogger } from '../../utils/utils.js';
import {
  WindowManager,
  extensionTabName,
  ledgerConnectTabName,
} from '../../helpers/windowManager.js';
import { testWalletLedger } from '../../utils/testWallets.js';
import BasePage from '../../pages/basepage.js';
import AddNewWallet from '../../pages/addNewWallet.page.js';
import TransactionsSubTab from '../../pages/wallet/walletTab/walletTransactions.page.js';
import ReceiveSubTab from '../../pages/wallet/walletTab/receiveSubTab.page.js';
import {
  threeSeconds,
  oneMinute,
  quarterSecond,
  fiveSeconds,
} from '../../helpers/timeConstants.js';
import driversPoolsManager from '../../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { SpeculosDockerController } from '../../helpers/speculos/speculosDockerController.js';
import { LedgerEmulatorController } from '../../helpers/ledgerEmulatorController.js';
import { convertVerifiedAddressesInfo, LedgerModels } from '../../helpers/ledgerHelper.js';
import LedgerConnect from '../../pages/ledgerConnect.page.js';
import { preloadBrowserStorage } from '../../helpers/restoreWalletHelper.js';

for (const model in LedgerModels) {
  describe(`Verify address on Ledger ${model}`, function () {
    this.timeout(2 * oneMinute);
    /** @type {SpeculosDockerController} */
    let speculosDockerController = null;
    /** @type {WebDriver} */
    let webdriver = null;
    /** @type {Logger} */
    let logger = null;
    /** @type {LedgerEmulatorController} */
    let ledgerController = null;
    /** @type {WindowManager} */
    let windowManager = null;

    before(async function () {
      const speculosDockerLogger = getTestLogger('speculosDocker', this.test.parent.title);
      speculosDockerController = new SpeculosDockerController(
        speculosDockerLogger,
        LedgerModels[model],
        testWalletLedger.mnemonic
      );
      await speculosDockerController.runContainer();

      webdriver = await driversPoolsManager.getDriverFromPool();
      logger = getTestLogger(this.test.parent.title);

      const ledgerLogger = getTestLogger('ledger', this.test.parent.title);
      ledgerController = new LedgerEmulatorController(ledgerLogger, LedgerModels[model]);

      const wmLogger = getTestLogger('windowManager', this.test.parent.title);
      windowManager = new WindowManager(webdriver, wmLogger);
      await windowManager.init();
      await preloadBrowserStorage(webdriver, logger, null, true, {
        'test-CURRENT_NETWORK_ID': '0',
      });
    });

    it('Ledger is ready', async function () {
      const ledgerState = await ledgerController.cardanoIsReady(threeSeconds, quarterSecond);
      expect(ledgerState, 'Cardano app is not ready').to.true;
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
      if (ledgerController.isLedgerX()) {
        await ledgerConnectPage.selectNanoX();
      } else {
        await ledgerConnectPage.selectNanoS();
      }
      await ledgerController.confirmExportPubKeys();
      const ledgerState = await ledgerController.cardanoIsReady(threeSeconds, quarterSecond);
      expect(ledgerState, 'Cardano app is not ready').to.true;
      await windowManager.waitForClosingAndSwitchTo(ledgerConnectTabName, extensionTabName);
    });

    it('Enter wallet details', async function () {
      const addNewWalletPage = new AddNewWallet(webdriver, logger);
      await addNewWalletPage.enterHWWalletName(testWalletLedger.name);
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
      await windowManager.findNewWindowAndSwitchTo(ledgerConnectTabName);
      const ledgerConnectPage = new LedgerConnect(webdriver, logger);
      await ledgerConnectPage.continue();
      const ledgerIsReady = await ledgerController.isReadyForAction(fiveSeconds, quarterSecond);
      expect(ledgerIsReady, `Ledger isn't ready after ${fiveSeconds / 1000} seconds`).to.be.true;

      const fullData = await ledgerController.fullConfirmAndGetContent();
      await windowManager.waitForClosingAndSwitchTo(ledgerConnectTabName, extensionTabName);

      const cleanedLedgerData = convertVerifiedAddressesInfo(fullData);

      expect(cleanedLedgerData.addressFull, 'Receive address is different').to.equal(
        verifyModalInfo.addressFull
      );
      expect(cleanedLedgerData.addressDerivationPath, 'Derivation path is different').to.equal(
        verifyModalInfo.derivationPath
      );
    });

    afterEach(function (done) {
      customAfterEach(this, webdriver, logger);
      done();
    });

    after(async function () {
      const basePage = new BasePage(webdriver, logger);
      basePage.closeBrowser();
      await speculosDockerController.killAndRemove();
    });
  });
}
