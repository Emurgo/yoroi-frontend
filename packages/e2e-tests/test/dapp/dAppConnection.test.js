import BasePage from '../../pages/basepage.js';
import { customAfterEach } from '../../utils/customHooks.js';
import { testWallet1 } from '../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { restoreWallet } from '../../helpers/restoreWalletHelper.js';
import { WindowManager, extensionTabName, mockDAppName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import ConnectorTab from '../../pages/wallet/connectorTab/connectorTab.page.js';
import driversPoolsManager from '../../utils/driversPool.js';

describe('dApp, connection in extension', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let windowManager = null;
  let mockServer = null;
  let mockedDApp = null;

  before(function (done) {
    webdriver = driversPoolsManager.getDriverFromPool();
    mockServer = getMockServer({});
    const wmLogger = getTestLogger('windowManager', this.test.parent.title);
    windowManager = new WindowManager(webdriver, wmLogger);
    windowManager.init();
    const dappLogger = getTestLogger('dApp', this.test.parent.title);
    mockedDApp = new MockDAppWebpage(webdriver, dappLogger);
    logger = getTestLogger(this.test.parent.title);
    done();
  });

  it('Restore a 15-word wallet', async function () {
    await restoreWallet(webdriver, logger, testWallet1);
  });

  it('Open a dapp page', async function () {
    await windowManager.openNewTab(mockDAppName, mockDAppUrl);
  });

  it('Connect the wallet without auth to the dapp', async function () {
    await connectNonAuth(webdriver, logger, windowManager, mockedDApp, testWallet1);
  });

  it('Connection is displayed in the extension', async function () {
    // switch to the extension
    await windowManager.switchTo(extensionTabName);
    // go to the extension connector tab
    const connectorTabPage = new ConnectorTab(webdriver, logger);
    await connectorTabPage.goToConnectorTab();
    // check displayed info
    const connectedWalletInfo = await connectorTabPage.getConnectedWalletInfo(testWallet1.name);
    expect(connectedWalletInfo.walletBalance).to.equal(testWallet1.balance);
    expect(connectedWalletInfo.dappUrl).to.equal('localhost');
  });

  it('Disconnect the wallet', async function () {
    const connectorTabPage = new ConnectorTab(webdriver, logger);
    await connectorTabPage.disconnectWallet(testWallet1.name, 'localhost');
    const connectedWalletsAmount = (await connectorTabPage.getAllConnectedWallets()).length;
    expect(connectedWalletsAmount).to.equal(0);
  });

  it('Check connection state in the dApp', async function () {
    await windowManager.switchTo(mockDAppName);
    const connectionSate = await mockedDApp.getConnectionState();
    expect(connectionSate).to.be.false;
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
