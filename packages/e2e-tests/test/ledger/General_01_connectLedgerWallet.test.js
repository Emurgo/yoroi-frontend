import { expect } from 'chai';
import { customAfterEach } from '../../utils/customHooks.js';
import { getTestLogger } from '../../utils/utils.js';
import { LedgerEmulatorController } from '../../helpers/ledgerEmulatorController.js';
import { WindowManager, extensionTabName, ledgerConnectTabName } from '../../helpers/windowManager.js';
import AddNewWallet from '../../pages/addNewWallet.page.js';
import LedgerConnect from '../../pages/ledgerConnect.page.js';
import TransactionsSubTab from '../../pages/wallet/walletTab/walletTransactions.page.js';
import driversPoolsManager from '../../utils/driversPool.js';
import { oneMinute, quarterSecond, threeSeconds } from '../../helpers/timeConstants.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { SpeculosDockerController } from '../../helpers/speculos/speculosDockerController.js';
import { LedgerModels } from '../../helpers/ledgerHelper.js';
import { testWalletLedger } from '../../utils/testWallets.js';
import { preloadBrowserStorage } from '../../helpers/restoreWalletHelper.js';

for (const model in LedgerModels) {
  describe(`Connect Ledger HW wallet ${model}`, function () {
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
    /** @type {AddNewWallet} */
    let addNewWalletPage = null;
    /** @type {LedgerConnect} */
    let ledgerConnectPage = null;
    /** @type {TransactionsSubTab} */
    let transactionsPage = null;

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
      addNewWalletPage = new AddNewWallet(webdriver, logger);
      ledgerConnectPage = new LedgerConnect(webdriver, logger);
      transactionsPage = new TransactionsSubTab(webdriver, logger);
    });

    it('Ledger is ready', async function () {
      const ledgerState = await ledgerController.cardanoIsReady(threeSeconds, quarterSecond);
      expect(ledgerState, 'Cardano app is not ready').to.true;
    });

    it('Selecting Connect HW wallet', async function () {
      await addNewWalletPage.selectConnectHW();
      await addNewWalletPage.selectLedgerHW();
      await addNewWalletPage.confirmChecking();
      await addNewWalletPage.connectHardwareWallet();
    });

    it('Approve connection', async function () {
      await windowManager.findNewWindowAndSwitchTo(ledgerConnectTabName);
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
      await addNewWalletPage.enterHWWalletName(testWalletLedger.name);
      await addNewWalletPage.saveHWInfo();
    });

    it('Check new wallet', async function () {
      await transactionsPage.waitPrepareWalletBannerIsClosed();
      const txPageIsDisplayed = await transactionsPage.isDisplayed();
      expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
      const walletInfo = await transactionsPage.getSelectedWalletInfo();
      expect(walletInfo.balance, 'The wallet balance is different').to.equal(testWalletLedger.balance);
      expect(walletInfo.name, `The wallet name should be Speculos.`).to.equal(testWalletLedger.name);
      expect(walletInfo.plate, `The wallet plate is different`).to.equal(testWalletLedger.plate);
    });

    afterEach(async function () {
      await customAfterEach(this, webdriver, logger);
    });

    after(async function () {
      await transactionsPage.closeBrowser();
      await speculosDockerController.killAndRemove();
    });
  });
}
