import BasePage from '../../pages/basepage.js';
import { getDriver } from '../../utils/driverBootstrap.js';
import { customAfterEach } from '../../utils/customHooks.js';
import InitialStepsPage from '../../pages/initialSteps.page.js';
import { testWallet1 } from '../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { restoreWallet } from '../../helpers/restoreWalletHelper.js';
import {
  WindowManager,
  extensionTabName,
  mockDAppName,
  popupConnectorName,
} from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import ConnectorTab from '../../pages/wallet/connectorTab/connectorTab.page.js';
import DAppConnectWallet from '../../pages/dapp/dAppConnectWallet.page.js';

describe('dApp, connection, no wallets', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let windowManager = null;
  let mockServer = null;
  let mockedDApp = null;

  before(function (done) {
    webdriver = getDriver();
    mockServer = getMockServer({});
    const wmLogger = getTestLogger('windowManager', this.test.parent.title);
    windowManager = new WindowManager(webdriver, wmLogger);
    windowManager.init();
    const dappLogger = getTestLogger('dApp', this.test.parent.title);
    mockedDApp = new MockDAppWebpage(webdriver, dappLogger);
    logger = getTestLogger(this.test.parent.title);
    const basePage = new BasePage(webdriver, logger);
    // first open the dapp page
    basePage.goToUrl(mockDAppUrl);
    done();
  });

  it('Request connection', async function () {
    await mockedDApp.requestNonAuthAccess();
    const dappConnectPage = new DAppConnectWallet(webdriver, logger);
    const popUpAppeared = await dappConnectPage.popUpIsDisplayed(windowManager);
    expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
  });

  it('No wallet are displayed', async function () {
    const dappConnectPage = new DAppConnectWallet(webdriver, logger);
    const warningIsDisplayed = await dappConnectPage.noWalletsWarningIsDisplayed();
    expect(warningIsDisplayed).to.be.true;
    await dappConnectPage.clickCreateWallet();
    const popUpIsClosed = await windowManager.isClosed(popupConnectorName);
    expect(popUpIsClosed).to.be.true;
  });

  it('Pass initials steps and restore a wallet', async function () {
    await windowManager.findNewWindowAndSwitchTo(extensionTabName);
    const initialStepsPage = new InitialStepsPage(webdriver, logger);
    await initialStepsPage.skipInitialSteps();
    await restoreWallet(webdriver, logger, testWallet1);
  });

  it('Try to connect the dapp the wallet again', async function () {
    await windowManager.switchTo(mockDAppName);
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
