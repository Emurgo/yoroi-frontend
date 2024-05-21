import BasePage from '../../pages/basepage.js';
import { customAfterEach, customBeforeNestedDAppTest } from '../../utils/customHooks.js';
import { testWallet1 } from '../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { restoreWallet } from '../../helpers/restoreWalletHelper.js';
import { WindowManager, mockDAppName, popupConnectorName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import DAppSignData from '../../pages/dapp/dAppSignData.page.js';
import { getPassword } from '../../helpers/constants.js';
import { DataSignErrorCode } from '../../helpers/mock-dApp-webpage/cip30Errors.js';
import driversPoolsManager from '../../utils/driversPool.js';

describe('dApp, CIP-95, signData', function () {
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

  describe('[nested-dapp] DRepIdHex', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Send cip95 sign data request, DRepIdHex', async function () {
      const testMessage = 'test message sign data';
      // get dRepID
      const dRepIdResponse = await mockedDApp.getPubDRepKey(true);
      await mockedDApp.requestSigningDataCIP95(dRepIdResponse.retValue.dRepIDHex, testMessage);
      // wait for window
      const dappSignDataPage = new DAppSignData(webdriver, logger);
      // the window focus is switched to the pop-up here
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

    it('Check cip95 sign data response', async function () {
      // wait pop-up window is closed
      const result = await windowManager.isClosed(popupConnectorName);
      expect(result, 'The window|tab is still opened').to.be.true;
      await windowManager.switchTo(mockDAppName);
      // check sign data response
      const signDataResponse = await mockedDApp.getSigningDataCIP95Result();
      expect(signDataResponse.success).to.be.true;
      const retValue = signDataResponse.retValue;
      expect('key' in retValue).to.be.true;
      expect('signature' in retValue).to.be.true;
    });
  });

  describe('[nested-dapp] Regular address HEX', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Send cip95 sign data request, regular address HEX', async function () {
      const testMessage = 'test message sign data';
      await mockedDApp.requestUsedAddresses();
      const addressesResponse = await mockedDApp.getAddresses();
      const address = addressesResponse.retValue[0];

      await mockedDApp.requestSigningDataCIP95(address, testMessage);
      // wait for window
      const dappSignDataPage = new DAppSignData(webdriver, logger);
      // the window focus is switched to the pop-up here
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

    it('Check cip95 sign data response', async function () {
      // wait pop-up window is closed
      const result = await windowManager.isClosed(popupConnectorName);
      expect(result, 'The window|tab is still opened').to.be.true;
      await windowManager.switchTo(mockDAppName);
      // check sign data response
      const signDataResponse = await mockedDApp.getSigningDataCIP95Result();
      expect(signDataResponse.success).to.be.true;
      const retValue = signDataResponse.retValue;
      expect('key' in retValue).to.be.true;
      expect('signature' in retValue).to.be.true;
    });
  });

  describe('[nested-dapp] Invalid address, DRepIDBech32', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Send and check cip95 sign data request, DRepIDBech32', async function () {
      const testMessage = 'test message sign data';
      const dRepIdResponse = await mockedDApp.getPubDRepKey(true);
      await mockedDApp.requestSigningDataCIP95(dRepIdResponse.retValue.dRepIDBech32, testMessage);
      const signDataResponse = await mockedDApp.getSigningDataCIP95Result();
      expect(signDataResponse.success).to.be.false;
      expect(signDataResponse.errMsg.code).to.equal(DataSignErrorCode.AddressNotPK);
    });
  });

  describe('[nested-dapp] Invalid address, other wallet DRepID', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Send and check cip95 sign data request, other wallet DRepID', async function () {
      const testMessage = 'test message sign data';
      await mockedDApp.requestSigningDataCIP95(
        'bb72e2c1796ba57bc7bdb19b7bb59d6c711f17fdda768aff91882078',
        testMessage
      );
      const signDataResponse = await mockedDApp.getSigningDataCIP95Result();
      expect(signDataResponse.success).to.be.false;
      expect(signDataResponse.errMsg.code).to.equal(DataSignErrorCode.AddressNotPK);
    });
  });

  describe('[nested-dapp] Invalid address, empty string', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Send and check cip95 sign data request, empty string', async function () {
      const testMessage = 'test message sign data';
      await mockedDApp.requestSigningDataCIP95('', testMessage);
      const signDataResponse = await mockedDApp.getSigningDataCIP95Result();
      expect(signDataResponse.success).to.be.false;
      expect(signDataResponse.errMsg.code).to.equal(DataSignErrorCode.AddressNotPK);
    });
  });

  describe('[nested-dapp] Cancel signing', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Send cip95 sign data request, DRepIdHex', async function () {
      const testMessage = 'test message sign data';
      // get dRepID
      const dRepIdResponse = await mockedDApp.getPubDRepKey(true);
      await mockedDApp.requestSigningDataCIP95(dRepIdResponse.retValue.dRepIDHex, testMessage);
      // wait for window
      const dappSignDataPage = new DAppSignData(webdriver, logger);
      // the window focus is switched to the pop-up here
      const popUpAppeared = await dappSignDataPage.popUpIsDisplayed(windowManager);
      expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
      await dappSignDataPage.waitingConnectorIsReady();
      // check that the message is correct
      const displayedMessage = await dappSignDataPage.getDisplayedMessage();
      expect(displayedMessage).to.equal(testMessage);
    });

    it('Cancel signing data and check response', async function () {
      const dappSignDataPage = new DAppSignData(webdriver, logger);
      await dappSignDataPage.cancelSigning();
      // wait pop-up window is closed
      const result = await windowManager.isClosed(popupConnectorName);
      expect(result, 'The window|tab is still opened').to.be.true;
      await windowManager.switchTo(mockDAppName);
      // check sign data response
      const signDataResponse = await mockedDApp.getSigningDataCIP95Result();
      expect(signDataResponse.success).to.be.false;
      expect(signDataResponse.errMsg.code).to.equal(DataSignErrorCode.UserDeclined);
    });
  });

  describe('[nested-dapp] Close pop-up', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Send cip95 sign data request, DRepIdHex', async function () {
      const testMessage = 'test message sign data';
      // get dRepID
      const dRepIdResponse = await mockedDApp.getPubDRepKey(true);
      await mockedDApp.requestSigningDataCIP95(dRepIdResponse.retValue.dRepIDHex, testMessage);
      // wait for window
      const dappSignDataPage = new DAppSignData(webdriver, logger);
      // the window focus is switched to the pop-up here
      const popUpAppeared = await dappSignDataPage.popUpIsDisplayed(windowManager);
      expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
      await dappSignDataPage.waitingConnectorIsReady();
      // check that the message is correct
      const displayedMessage = await dappSignDataPage.getDisplayedMessage();
      expect(displayedMessage).to.equal(testMessage);
    });

    it('Close pop-up and check response', async function () {
      await windowManager.closeTabWindow(popupConnectorName, mockDAppName);
      // check sign data response
      const signDataResponse = await mockedDApp.getSigningDataCIP95Result();
      expect(signDataResponse.success).to.be.false;
      expect(signDataResponse.errMsg.code).to.equal(DataSignErrorCode.UserDeclined);
    });
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