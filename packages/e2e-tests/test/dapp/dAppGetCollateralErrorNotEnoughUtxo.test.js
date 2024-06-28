import BasePage from '../../pages/basepage.js';
import { customAfterEach } from '../../utils/customHooks.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { createWallet } from '../../helpers/restoreWalletHelper.js';
import { WindowManager, mockDAppName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import { adaInLovelaces, getTestWalletName } from '../../helpers/constants.js';
import { ApiErrorCode } from '../../helpers/mock-dApp-webpage/cip30Errors.js';
import driversPoolsManager from '../../utils/driversPool.js';

describe('dApp, getCollateral, error, empty wallet, not auth', function () {
  const testWalletName = getTestWalletName();
  let newTestWallet = {
    name: '',
    plate: '',
    balance: 0,
  };
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
    const basePage = new BasePage(webdriver, logger);
    basePage.goToExtension();
  });

  it('Create an empty wallet', async function () {
    newTestWallet = await createWallet(webdriver, logger, testWalletName);
  });

  it('Open a dapp page', async function () {
    await windowManager.openNewTab(mockDAppName, mockDAppUrl);
  });

  it('Connect the wallet without auth to the dapp', async function () {
    await connectNonAuth(webdriver, logger, windowManager, mockedDApp, newTestWallet);
  });

  it('Getting collateral for 1 ADA', async function () {
    const collateralResponse = await mockedDApp.getCollateral(String(1 * adaInLovelaces));
    expect(collateralResponse.success, 'The request getCollateral was successful').to.be.false;
    expect(collateralResponse.errMsg.code, 'A wrong error code is received').to.equal(
      ApiErrorCode.InternalError
    );
    expect(collateralResponse.errMsg.info, 'Wrong error message is received').to.equal(
      'not enough UTXOs'
    );
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
