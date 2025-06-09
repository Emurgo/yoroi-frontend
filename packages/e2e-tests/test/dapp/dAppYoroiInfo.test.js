import BasePage from '../../pages/basepage.js';
import { customAfterEach } from '../../utils/customHooks.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { WindowManager, mockDAppName } from '../../helpers/windowManager.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { yoroiObject } from '../../helpers/constants.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import driversPoolsManager from '../../utils/driversPool.js';
import { collectInfo, preloadDBAndStorage, waitTxPage } from '../../helpers/restoreWalletHelper.js';

describe('dApp, Yoroi object in Cardano', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let windowManager = null;
  let mockServer = null;
  let mockedDApp = null;

  before(async function () {
    try {
      mockServer = await getMockServer({});
      webdriver = await driversPoolsManager.getPreparedDriver();
      logger = getTestLogger(this.test.parent.title);
      const wmLogger = getTestLogger('windowManager', this.test.parent.title);
      const dappLogger = getTestLogger('dApp', this.test.parent.title);
      windowManager = new WindowManager(webdriver, wmLogger);
      await windowManager.init();
      mockedDApp = new MockDAppWebpage(webdriver, dappLogger);
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
