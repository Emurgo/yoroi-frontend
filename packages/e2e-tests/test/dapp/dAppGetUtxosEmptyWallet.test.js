import { customAfterEach } from '../../utils/customHooks.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { WindowManager, mockDAppName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import { getTestWalletName } from '../../helpers/constants.js';
import { collectInfo, createWallet, preloadBrowserStorage } from '../../helpers/restoreWalletHelper.js';
import driversPoolsManager from '../../utils/driversPool.js';
import { Logger } from 'simple-node-logger';
import { WebDriver } from 'selenium-webdriver';
import WalletCommonBase from '../../pages/walletCommonBase.page.js';

describe('dApp, getUtxos, empty wallet', function () {
  const testWalletName = getTestWalletName();
  let newTestWallet = {
    name: '',
    plate: '',
    balance: 0,
  };
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
      webdriver = await driversPoolsManager.getPreparedDriver();
      mockServer = await getMockServer({});
      logger = getTestLogger(this.test.parent.title);
      const wmLogger = getTestLogger('windowManager', this.test.parent.title);
      const dappLogger = getTestLogger('dApp', this.test.parent.title);
      windowManager = new WindowManager(webdriver, wmLogger);
      await windowManager.init();
      mockedDApp = new MockDAppWebpage(webdriver, dappLogger);
      walletCommonPage = new WalletCommonBase(webdriver, logger);
      await preloadBrowserStorage(webdriver, logger);
    } catch (error) {
      await collectInfo(this, webdriver, logger);
      throw new Error(error);
    }
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

  it('Request getUtxos', async function () {
    const getUtxosResponse = await mockedDApp.getUTXOs();
    expect(getUtxosResponse.success, 'The request getUtxos failed').to.be.true;
    expect(getUtxosResponse.retValue).to.be.an('array').that.is.empty;
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletCommonPage.closeBrowser();
    mockServer.close();
  });
});
