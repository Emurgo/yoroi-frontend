import { customAfterEach, customBeforeNestedDAppTest } from '../../utils/customHooks.js';
import { testWallet1 } from '../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { WindowManager, mockDAppName, popupConnectorName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import DAppSignData from '../../pages/dapp/dAppSignData.page.js';
import { getPassword } from '../../helpers/constants.js';
import { DataSignErrorCode } from '../../helpers/mock-dApp-webpage/cip30Errors.js';
import driversPoolsManager from '../../utils/driversPool.js';
import { collectInfo, preloadDBAndStorage, waitTxPage } from '../../helpers/restoreWalletHelper.js';
import { Logger } from 'simple-node-logger';
import { WebDriver } from 'selenium-webdriver';

describe('dApp, signData', function () {
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
  /** @type {DAppSignData} */
  let dappSignDataPage = null;

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
      dappSignDataPage = new DAppSignData(webdriver, logger);
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

  describe('[nested-dapp] Positive case', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Send sign data request', async function () {
      const testMessage = 'test message sign data';
      await mockedDApp.requestUsedAddresses();
      await mockedDApp.requestSigningData(testMessage);
      // wait for window, the window focus is switched to the pop-up here
      const popUpAppeared = await dappSignDataPage.popUpIsDisplayed(windowManager);
      expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
      await dappSignDataPage.waitingConnectorIsReady();
      // check that the message is correct
      const displayedMessage = await dappSignDataPage.getDisplayedMessage();
      expect(displayedMessage).to.equal(testMessage);
      // sign data request
      await dappSignDataPage.enterPassword(getPassword());
      await dappSignDataPage.confirmSigning();
    });

    it('Check sign data response', async function () {
      // wait pop-up window is closed
      const result = await windowManager.isClosed(popupConnectorName);
      expect(result, 'The window|tab is still opened').to.be.true;
      await windowManager.switchTo(mockDAppName);
      // check sign data response
      const signDataResponse = await mockedDApp.getSigningDataResult();
      expect(signDataResponse.success).to.be.true;
      const retValue = signDataResponse.retValue;
      expect('key' in retValue).to.be.true;
      expect('signature' in retValue).to.be.true;
    });
  });

  describe('[nested-dapp] Cancel signing', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Send sign data request', async function () {
      const testMessage = 'test message sign data';
      await mockedDApp.requestUsedAddresses();
      await mockedDApp.requestSigningData(testMessage);
      // wait for window, the window focus is switched to the pop-up here
      const popUpAppeared = await dappSignDataPage.popUpIsDisplayed(windowManager);
      expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
      await dappSignDataPage.waitingConnectorIsReady();
      // check that the message is correct
      const displayedMessage = await dappSignDataPage.getDisplayedMessage();
      expect(displayedMessage).to.equal(testMessage);
    });

    it('Cancel signing data and check response', async function () {
      await dappSignDataPage.cancelSigning();
      // wait pop-up window is closed
      const result = await windowManager.isClosed(popupConnectorName);
      expect(result, 'The window|tab is still opened').to.be.true;
      await windowManager.switchTo(mockDAppName);
      // check sign data response
      const signDataResponse = await mockedDApp.getSigningDataResult();
      expect(signDataResponse.success).to.be.false;
      expect(signDataResponse.errMsg.code).to.equal(DataSignErrorCode.UserDeclined);
    });
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await dappSignDataPage.closeBrowser();
    mockServer.close();
  });
});
