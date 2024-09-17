import BasePage from '../../pages/basepage.js';
import { customAfterEach } from '../../utils/customHooks.js';
import { testWallet1 } from '../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { restoreWallet } from '../../helpers/restoreWalletHelper.js';
import { WindowManager, mockDAppName, popupConnectorName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import DAppConnectWallet from '../../pages/dapp/dAppConnectWallet.page.js';
import { ApiErrorCode } from '../../helpers/mock-dApp-webpage/cip30Errors.js';
import driversPoolsManager from '../../utils/driversPool.js';

describe('dApp, cancel connection', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let windowManager = null;
  let mockServer = null;
  let mockedDApp = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    mockServer = getMockServer({});
    const wmLogger = getTestLogger('windowManager', this.test.parent.title);
    windowManager = new WindowManager(webdriver, wmLogger);
    windowManager.init();
    const dappLogger = getTestLogger('dApp', this.test.parent.title);
    mockedDApp = new MockDAppWebpage(webdriver, dappLogger);
    logger = getTestLogger(this.test.parent.title);
  });

  it('Restore a 15-word wallet', async function () {
    await restoreWallet(webdriver, logger, testWallet1);
  });

  it('Open a dapp page', async function () {
    await windowManager.openNewTab(mockDAppName, mockDAppUrl);
  });

  it('Request connection the wallet without auth to the dapp', async function () {
    await mockedDApp.requestNonAuthAccess();
    const dappConnectPage = new DAppConnectWallet(webdriver, logger);
    // the window focus is switched to the pop-up here
    const popUpAppeared = await dappConnectPage.popUpIsDisplayed(windowManager);
    expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
    const allWallets = await dappConnectPage.getWallets();
    expect(allWallets.length).to.equal(1);
    const walletInfo = await dappConnectPage.getWalletInfo(testWallet1.plate);
    expect(walletInfo.walletBalance, 'The wallet balance is different').to.equal(
      testWallet1.balance
    );
    expect(walletInfo.walletName, `The wallet name is different`).to.equal(testWallet1.name);
    expect(walletInfo.walletPlate, `The wallet plate is different`).to.equal(testWallet1.plate);
  });

  it('Close the pop-up window', async function () {
    // close the pop-up window
    await windowManager.closeTabWindow(popupConnectorName, mockDAppName);
    // check the response
    await windowManager.switchTo(mockDAppName);
    const requestAccessResult = await mockedDApp.checkAccessRequest();
    expect(requestAccessResult.success).to.be.false;
    expect(requestAccessResult.errMsg.code).to.equal(ApiErrorCode.Refused);
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
