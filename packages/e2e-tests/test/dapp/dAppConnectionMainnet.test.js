import BasePage from '../../pages/basepage.js';
import { customAfterEach } from '../../utils/customHooks.js';
import { testWallet1Mainnet } from '../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { WindowManager, extensionTabName, mockDAppName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import ConnectorTab from '../../pages/wallet/connectorTab/connectorTab.page.js';
import driversPoolsManager from '../../utils/driversPool.js';
import { collectInfo, preloadDBAndStorage, waitTxPage } from '../../helpers/restoreWalletHelper.js';
import { Logger } from 'simple-node-logger';
import { WebDriver } from 'selenium-webdriver';

describe('dApp, mainnet, connection in extension,', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {WindowManager} */
  let windowManager = null;
  let mockServer = null;
  /** @type {MockDAppWebpage} */
  let mockedDApp = null;

  before(async function () {
    try {
      mockServer = await getMockServer({});
      logger = getTestLogger(this.test.parent.title);
      webdriver = await driversPoolsManager.getDriverFromPool();
      const wmLogger = getTestLogger('windowManager', this.test.parent.title);
      windowManager = new WindowManager(webdriver, wmLogger);
      await windowManager.init();
      const dappLogger = getTestLogger('dApp', this.test.parent.title);
      mockedDApp = new MockDAppWebpage(webdriver, dappLogger);
      await preloadDBAndStorage(webdriver, logger, 'testWallet1Mainnet', false);
      await waitTxPage(webdriver, logger);
    } catch (error) {
      await collectInfo(this, webdriver, logger);
      throw new Error(error);
    }
  });

  it('Open a dapp page', async function () {
    await windowManager.openNewTab(mockDAppName, mockDAppUrl);
  });

  it('Connect the wallet to the dapp', async function () {
    await connectNonAuth(webdriver, logger, windowManager, mockedDApp, testWallet1Mainnet);
  });

  it('Connection is displayed in the extension', async function () {
    // switch to the extension
    await windowManager.switchTo(extensionTabName);
    // go to the extension connector tab
    const connectorTabPage = new ConnectorTab(webdriver, logger);
    await connectorTabPage.goToConnectorTab();
    // check displayed info
    const connectedWalletInfo = await connectorTabPage.getConnectedWalletInfo(testWallet1Mainnet.name);
    expect(connectedWalletInfo.walletBalance).to.equal(testWallet1Mainnet.balance);
    expect(connectedWalletInfo.dappUrl).to.equal('localhost');
  });

  it('Disconnect the wallet', async function () {
    const connectorTabPage = new ConnectorTab(webdriver, logger);
    await connectorTabPage.disconnectWallet(testWallet1Mainnet.name, 'localhost');
    const connectedWalletsAmount = (await connectorTabPage.getAllConnectedWallets()).length;
    expect(connectedWalletsAmount).to.equal(0);
  });

  it('Check connection state in the dApp', async function () {
    await windowManager.switchTo(mockDAppName);
    const connectionSate = await mockedDApp.isEnabled();
    expect(connectionSate.retValue, 'Wallet is still connected').to.be.false;
  });

  afterEach(function (done) {
    customAfterEach(this, webdriver, logger);
    done();
  });

  after(function (done) {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
    mockServer.close();
    done();
  });
});
