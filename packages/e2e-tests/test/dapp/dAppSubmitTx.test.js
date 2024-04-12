import BasePage from '../../pages/basepage.js';
import { customAfterEach, customBeforeNestedDAppTest } from '../../utils/customHooks.js';
import { getSpendableWallet } from '../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { restoreWallet } from '../../helpers/restoreWalletHelper.js';
import { WindowManager, mockDAppName, popupConnectorName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import { adaInLovelaces, getPassword } from '../../helpers/constants.js';
import DAppSignTx from '../../pages/dapp/dAppSignTx.page.js';
import { signTxWithCSL } from '../../helpers/mock-dApp-webpage/dAppTxHelper.js';
import { ApiErrorCode, TxSendErrorCode } from '../../helpers/mock-dApp-webpage/cip30Errors.js';
import driversPoolsManager from '../../utils/driversPool.js';

describe('dApp, submitTx', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let windowManager = new WindowManager(webdriver, logger);
  let mockServer = null;
  let mockedDApp = new MockDAppWebpage(webdriver, logger);
  let uTxHex = '';
  let witnessSet = '';
  const testWallet = getSpendableWallet();

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
    await restoreWallet(webdriver, logger, testWallet);
  });

  it('Open a dapp page', async function () {
    await windowManager.openNewTab(mockDAppName, mockDAppUrl);
  });

  it('Connect the wallet without auth to the dapp', async function () {
    await connectNonAuth(webdriver, logger, windowManager, mockedDApp, testWallet, false);
  });

  describe('[nested-dapp] Submit Tx, positive', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request "signTx"', async function () {
      // get a receiver address
      await mockedDApp.requestUnusedAddresses();
      const unusedAddresses = await mockedDApp.getAddresses();
      const receiverAddr = unusedAddresses.retValue[0];
      const requestedAmount = String(1 * adaInLovelaces);
      // send sign request with 1 ada
      const signingRequest = await mockedDApp.requestSigningTx(requestedAmount, receiverAddr);
      uTxHex = signingRequest.uTxHex;
    });

    it('Sign tx and check response', async function () {
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      const popUpAppeared = await dappSingTxPage.popUpIsDisplayed(windowManager);
      expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
      await dappSingTxPage.waitingConnectorIsReady();
      await dappSingTxPage.enterPassword(getPassword());
      await dappSingTxPage.confirmSigning();

      // pop up is closed, switching to dapp
      const result = await windowManager.isClosed(popupConnectorName);
      expect(result, 'The window|tab is still opened').to.be.true;
      await windowManager.switchTo(mockDAppName);

      // check sign data response
      const signTxResponse = await mockedDApp.getSigningTxResult();
      expect(signTxResponse.success).to.be.true;
      expect(signTxResponse.retValue).to.be.an('string').that.is.not.empty;
      witnessSet = signTxResponse.retValue;
    });

    it('Submit Tx and check response', async function () {
      const signedTxHex = signTxWithCSL(uTxHex, witnessSet);
      const submitResponse = await mockedDApp.submitTx(signedTxHex);
      expect(submitResponse.success, 'Submit Tx request failed').to.be.true;
      expect(submitResponse.retValue).to.be.an('string').that.is.not.empty;
    });
  });

  describe('[nested-dapp] Submit Tx, undefined Tx', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Submit Tx with undefined and check response', async function () {
      const submitResponse = await mockedDApp.submitTx(undefined);
      expect(submitResponse.success, 'Submit Tx request pass').to.be.false;
      expect(submitResponse.errMsg.code).to.equal(ApiErrorCode.InternalError);
    });
  });

  describe('[nested-dapp] Submit Tx, unsigned Tx', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request "signTx"', async function () {
      // get a receiver address
      await mockedDApp.requestUnusedAddresses();
      const unusedAddresses = await mockedDApp.getAddresses();
      const receiverAddr = unusedAddresses.retValue[0];
      const requestedAmount = String(1 * adaInLovelaces);
      // send sign request with 1 ada
      const signingRequest = await mockedDApp.requestSigningTx(requestedAmount, receiverAddr);
      uTxHex = signingRequest.uTxHex;
    });

    it('Sign tx', async function () {
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      const popUpAppeared = await dappSingTxPage.popUpIsDisplayed(windowManager);
      expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
      await dappSingTxPage.waitingConnectorIsReady();
      await dappSingTxPage.enterPassword(getPassword());
      await dappSingTxPage.confirmSigning();

      // pop up is closed, switching to dapp
      const result = await windowManager.isClosed(popupConnectorName);
      expect(result, 'The window|tab is still opened').to.be.true;
      await windowManager.switchTo(mockDAppName);
    });

    it('Submit Tx and check response', async function () {
      const submitResponse = await mockedDApp.submitTx(uTxHex);
      expect(submitResponse.success, 'Submit Tx request pass').to.be.false;
      expect(submitResponse.errMsg.code).to.equal(TxSendErrorCode.Failure);
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
