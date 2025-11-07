import { customAfterEach, customBeforeNestedDAppTest } from '../../utils/customHooks.js';
import { testWallet1 } from '../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { WindowManager, mockDAppName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import { adaInLovelaces } from '../../helpers/constants.js';
import driversPoolsManager from '../../utils/driversPool.js';
import { collectInfo, preloadDBAndStorage, waitTxPage } from '../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import WalletCommonBase from '../../pages/walletCommonBase.page.js';

// Related issue https://emurgo.atlassian.net/browse/YOEXT-1723
describe('dApp, getUtxos, nested tests', function () {
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
      webdriver = await driversPoolsManager.getDriverFromPool();
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

  describe('[nested-dapp] getUtxos, 1 ADA', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getUtxos for 1 ADA', async function () {
      const getUtxosResponse = await mockedDApp.getUTXOs(String(1 * adaInLovelaces));
      expect(getUtxosResponse.success, 'The request getUtxos failed').to.be.true;
      expect(getUtxosResponse.retValue).to.be.an('array').that.is.not.empty;
      for (const utxo of getUtxosResponse.retValue) {
        const adaAmount = parseFloat(utxo.amount) / adaInLovelaces;
        expect(adaAmount).to.be.at.least(1);
      }
    });
  });

  describe('[nested-dapp] getUtxos, more than have', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getUtxos for 10 ADA', async function () {
      const getUtxosResponse = await mockedDApp.getUTXOs(String(10 * adaInLovelaces), false);
      expect(getUtxosResponse.success, 'The request getUtxos failed').to.be.true;
      expect(getUtxosResponse.retValue).to.equal(null);
    });
  });

  describe('[nested-dapp] getUtxos, no amount in the request', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getUtxos with undefined amount', async function () {
      const getUtxosResponse = await mockedDApp.getUTXOs();
      expect(getUtxosResponse.success, 'The request getUtxos failed').to.be.true;
      expect(getUtxosResponse.retValue).to.be.an('array').that.is.not.empty;
      const sumUtxosAmount = getUtxosResponse.retValue.reduce((accumulator, utxo) => accumulator + parseFloat(utxo.amount), 0);
      const sumInAda = sumUtxosAmount / adaInLovelaces;
      expect(sumInAda).to.equal(testWallet1.balance);
    });
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletCommonPage.closeBrowser();
    mockServer.close();
  });
});
