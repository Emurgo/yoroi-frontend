import BasePage from '../../pages/basepage.js';
import { customAfterEach } from '../../utils/customHooks.js';
import { expect } from 'chai';
import { testWallet1 } from '../../utils/testWallets.js';
import { getTestLogger } from '../../utils/utils.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { WindowManager, mockDAppName } from '../../helpers/windowManager.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { yoroiObject } from '../../helpers/constants.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { restoreWallet } from '../../helpers/restoreWalletHelper.js';
import driversPoolsManager from '../../utils/driversPool.js';

describe('dApp, Yoroi object in Cardano', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let windowManager = null;
  let mockServer = null;
  let mockedDApp = null;

  before(function () {
    webdriver = driversPoolsManager.getDriverFromPool();
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

  it('Check Yoroi object in Cardano', async function () {
    const yoroiObjectResponse = await mockedDApp.getYoroiObject();
    expect(yoroiObjectResponse.success, 'Error happened while receiving "yoroi" object').to.be.true;
    expect(yoroiObjectResponse.retValue, 'An empty object is returned').to.be.an('object').that.is
      .not.empty;
    expect(yoroiObjectResponse.retValue.name).to.equal(yoroiObject.name);
    expect(yoroiObjectResponse.retValue.apiVersion).to.equal(yoroiObject.apiVersion);
    expect(yoroiObjectResponse.retValue.icon).to.equal(yoroiObject.icon);
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
