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
import { TxSignErrorCode } from '../../helpers/mock-dApp-webpage/cip30Errors.js';
import driversPoolsManager from '../../utils/driversPool.js';

describe('dApp, signTx, intrawallet Tx', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let windowManager = new WindowManager(webdriver, logger);
  let mockServer = null;
  let mockedDApp = new MockDAppWebpage(webdriver, logger);
  let expectedFee = 0;
  let receiverAddr = '';
  const testWallet = getSpendableWallet();
  const adaAmount = 2;

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

  describe('[nested-dapp] Positive case', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request signTx', async function () {
      // get a receiver address
      await mockedDApp.requestUnusedAddresses();
      const unusedAddresses = await mockedDApp.getAddresses();
      receiverAddr = unusedAddresses.retValue[0];
      const requestedAmount = String(adaAmount * adaInLovelaces);
      // send sign request with 1 ada
      const { txFee } = await mockedDApp.requestSigningTx(requestedAmount, receiverAddr);
      expectedFee = txFee;
    });

    it('Checking Sign Tx pop-up appeared', async function () {
      // wait for the pop-up appears
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      const popUpAppeared = await dappSingTxPage.popUpIsDisplayed(windowManager);
      expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
      await dappSingTxPage.waitingConnectorIsReady();
    });

    it('Checking info on Details page', async function () {
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      // check data on the Details page
      const displayedTotalAmount = await dappSingTxPage.getTotalAmount();
      const displayedFee = await dappSingTxPage.getFee();
      const displayedTotalNumber = parseFloat(displayedTotalAmount);
      const displayedFeeNumber = parseFloat(displayedFee);
      const storedFeeNumber = parseFloat(expectedFee) / adaInLovelaces;
      expect(displayedFeeNumber, 'Displayed fee is different from expected').to.equal(
        storedFeeNumber
      );
      // because it is intrawallet tx only fee + 0 is displayed in the total amount
      expect(displayedTotalNumber, 'Displayed total is different from expected').to.equal(
        storedFeeNumber
      );
    });

    it('Checking info on UTxOs page', async function () {
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      await dappSingTxPage.switchToUtxosTab();
      const outputsInfo = await dappSingTxPage.getOutputsInfo();
      const filteredAddrs = outputsInfo.yourAddrs.filter(
        addrInfo => addrInfo.addr === receiverAddr
      );
      expect(filteredAddrs, 'Receiver address is not in outputs').to.be.an('array').that.is.not
        .empty;
      expect(filteredAddrs.length, 'Receiver address appears several times').to.equal(1);
      const addrAssets = filteredAddrs[0].assets;
      expect(addrAssets, 'No tokens for the receiver address').to.be.an('array').that.is.not.empty;
      const filteredAddrAssets = addrAssets.filter(assetInfo => assetInfo.tokenName === 'ADA');
      expect(filteredAddrAssets.length, 'No ADA token for the receiver address').to.equal(1);
      expect(
        filteredAddrAssets[0].tokenAmount,
        'Different amount for the receiver address'
      ).to.equal(adaAmount);
    });

    it('Checking info on Connection page', async function () {
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      const connectionInfo = await dappSingTxPage.getConnectionInfo();
      expect(connectionInfo.pageUrl).to.equal('localhost');
      expect(connectionInfo.walletName).to.equal(testWallet.name);
      expect(connectionInfo.walletPlate).to.equal(testWallet.plate);
    });

    it('Sign tx and check response', async function () {
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      await dappSingTxPage.switchToDetailsTab();
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
    });
  });

  describe('[nested-dapp] Cancel Transaction', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request signTx', async function () {
      // get a receiver address
      await mockedDApp.requestUnusedAddresses();
      const unusedAddresses = await mockedDApp.getAddresses();
      const receiverAddr = unusedAddresses.retValue[0];
      const requestedAmount = String(1 * adaInLovelaces);
      // send sign request with 1 ada
      await mockedDApp.requestSigningTx(requestedAmount, receiverAddr);
    });

    it('Checking Sign Tx pop-up appeared', async function () {
      // wait for the pop-up appears
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      const popUpAppeared = await dappSingTxPage.popUpIsDisplayed(windowManager);
      expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
      await dappSingTxPage.waitingConnectorIsReady();
    });

    it('Cancel signing tx and check response', async function () {
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      await dappSingTxPage.switchToDetailsTab();
      await dappSingTxPage.cancelSigning();

      // pop up is closed, switching to dapp
      const result = await windowManager.isClosed(popupConnectorName);
      expect(result, 'The window|tab is still opened').to.be.true;
      await windowManager.switchTo(mockDAppName);

      // check sign data response
      const signTxResponse = await mockedDApp.getSigningTxResult();
      expect(signTxResponse.success).to.be.false;
      expect(signTxResponse.errMsg.code).to.equal(TxSignErrorCode.UserDeclined);
    });
  });

  describe('[nested-dapp] Close pop-up', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request signTx', async function () {
      // get a receiver address
      await mockedDApp.requestUnusedAddresses();
      const unusedAddresses = await mockedDApp.getAddresses();
      const receiverAddr = unusedAddresses.retValue[0];
      const requestedAmount = String(1 * adaInLovelaces);
      // send sign request with 1 ada
      await mockedDApp.requestSigningTx(requestedAmount, receiverAddr);
    });

    it('Checking Sign Tx pop-up appeared', async function () {
      // wait for the pop-up appears
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      const popUpAppeared = await dappSingTxPage.popUpIsDisplayed(windowManager);
      expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
      await dappSingTxPage.waitingConnectorIsReady();
    });

    it('Close the pop-up and check response', async function () {
      await windowManager.closeTabWindow(popupConnectorName, mockDAppName);

      // check sign data response
      const signTxResponse = await mockedDApp.getSigningTxResult();
      expect(signTxResponse.success).to.be.false;
      expect(signTxResponse.errMsg.code).to.equal(TxSignErrorCode.UserDeclined);
    });
  });

  describe('[nested-dapp] Incorrect Transaction', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request signTx for incorrect Tx', async function () {
      // send sign request with incorrect request
      const uTxHex =
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      await mockedDApp.requestSigningTxHex(uTxHex);
    });

    it('Checking Sign Tx pop-up appeared', async function () {
      // wait for the pop-up appears
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      const popUpAppeared = await dappSingTxPage.popUpIsDisplayed(windowManager);
      expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
      await dappSingTxPage.waitingConnectorIsReady();
    });

    it('Incorrect Tx, check response', async function () {
      // there should be no pop-up
      // just response with an error "Not suitable data is sent"
      const dappSingTxPage = new DAppSignTx(webdriver, logger);
      const errorMessage = await dappSingTxPage.getErrorMessage();
      expect(errorMessage, 'Something wrong with the error message').to.equal(
        'Unable to parse input transaction.'
      );

      await windowManager.closeTabWindow(popupConnectorName, mockDAppName);
      // check sign data response
      const signTxResponse = await mockedDApp.getSigningTxResult();
      expect(signTxResponse.success).to.be.false;
      expect(signTxResponse.errMsg.code).to.equal(TxSignErrorCode.UserDeclined);
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
