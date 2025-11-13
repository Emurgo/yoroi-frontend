import { customAfterEach } from '../../utils/customHooks.js';
import { testWallet1 } from '../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { WindowManager, mockDAppName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import { adaInLovelaces } from '../../helpers/constants.js';
import { ApiErrorCode } from '../../helpers/mock-dApp-webpage/cip30Errors.js';
import driversPoolsManager from '../../utils/driversPool.js';
import { collectInfo, preloadDBAndStorage, waitTxPage } from '../../helpers/restoreWalletHelper.js';
import { Logger } from 'simple-node-logger';
import { WebDriver } from 'selenium-webdriver';
import WalletCommonBase from '../../pages/walletCommonBase.page.js';

describe('dApp, getCollateral, error, max limit', function () {
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
  /** @type {WalletCommonBase} */
  let walletCommonPage = null;

  before(async function () {
    try {
      mockServer = await getMockServer({});
      logger = getTestLogger(this.test.parent.title);
      webdriver = await driversPoolsManager.getPreparedDriver();
      const wmLogger = getTestLogger('windowManager', this.test.parent.title);
      windowManager = new WindowManager(webdriver, wmLogger);
      await windowManager.init();
      const dappLogger = getTestLogger('dApp', this.test.parent.title);
      mockedDApp = new MockDAppWebpage(webdriver, dappLogger);
      walletCommonPage = new WalletCommonBase(webdriver, logger);
      await preloadDBAndStorage(webdriver, logger, 'testWallet1');
      await waitTxPage(webdriver, logger);
    } catch (error) {
      await collectInfo(this, webdriver, logger);
      throw new Error(error);
    }
  });

  it('Open a dapp page', async function () {
    await windowManager.openNewTab(mockDAppName, mockDAppUrl);
  });

  it('Connect the wallet without auth to the dapp', async function () {
    await connectNonAuth(webdriver, logger, windowManager, mockedDApp, testWallet1);
  });

  it('Getting collateral for 6 ADA', async function () {
    const collateralResponse = await mockedDApp.getCollateral(String(6 * adaInLovelaces));
    expect(collateralResponse.success, 'The request getCollateral was successful').to.be.false;
    expect(collateralResponse.errMsg.code, 'A wrong error code is received').to.equal(ApiErrorCode.InternalError);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletCommonPage.closeBrowser();
    mockServer.close();
  });
});
