import BasePage from '../../pages/basepage.js';
import { customAfterEach, customBeforeNestedDAppTest } from '../../utils/customHooks.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { collectInfo, preloadDBAndStorage, waitTxPage } from '../../helpers/restoreWalletHelper.js';
import { WindowManager, mockDAppName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import { adaInLovelaces } from '../../helpers/constants.js';
import driversPoolsManager from '../../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { testWallet1 } from '../../utils/testWallets.js';

describe('dApp, getCollateral, no popup, positive', function () {
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

  describe('[nested-dapp] Collateral, 1 ADA', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Getting collateral for 1 ADA', async function () {
      const collateralResponse = await mockedDApp.getCollateral(String(1 * adaInLovelaces));
      expect(collateralResponse.success, 'The request getCollateral failed').to.be.true;
      expect(collateralResponse.retValue).to.be.an('array').that.is.not.empty;
      expect(collateralResponse.retValue.length).to.be.equal(1);
      const receivedAmount = parseFloat(collateralResponse.retValue[0].amount) / adaInLovelaces;
      expect(receivedAmount, 'returned amount is less than 1 ADA').to.be.at.least(1);
    });
  });

  describe('[nested-dapp] Collateral, 3 ADA', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Getting collateral for 3 ADA', async function () {
      const collateralResponse = await mockedDApp.getCollateral(String(3 * adaInLovelaces));
      expect(collateralResponse.success, 'The request getCollateral failed').to.be.true;
      expect(collateralResponse.retValue).to.be.an('array').that.is.not.empty;
      expect(collateralResponse.retValue.length).to.be.equal(3);
      const sumUtxosAmount = collateralResponse.retValue.reduce(
        (accumulator, utxo) => accumulator + parseFloat(utxo.amount) / adaInLovelaces,
        0
      );
      expect(sumUtxosAmount, 'returned amount is less than 3 ADA').to.be.at.least(3);
    });
  });

  describe('[nested-dapp] Collateral, 5 ADA', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Getting collateral for 5 ADA', async function () {
      const collateralResponse = await mockedDApp.getCollateral(String(5 * adaInLovelaces));
      expect(collateralResponse.success, 'The request getCollateral failed').to.be.true;
      expect(collateralResponse.retValue).to.be.an('array').that.is.not.empty;
      expect(collateralResponse.retValue.length, 'There are more UTxOs then expected').to.be.at.most(3);
      const sumUtxosAmount = collateralResponse.retValue.reduce(
        (accumulator, utxo) => accumulator + parseFloat(utxo.amount) / adaInLovelaces,
        0
      );
      expect(sumUtxosAmount, 'returned amount is less than 5 ADA').to.be.at.least(5);
    });
  });

  describe('[nested-dapp] Collateral, amount is undefined', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Getting collateral for undefined amount', async function () {
      const collateralResponse = await mockedDApp.getCollateral();
      expect(collateralResponse.success, 'The request getCollateral failed').to.be.true;
      expect(collateralResponse.retValue).to.be.an('array').that.is.not.empty;
      expect(collateralResponse.retValue.length, 'There are more UTxOs then expected').to.be.at.most(3);
      const sumUtxosAmount = collateralResponse.retValue.reduce(
        (accumulator, utxo) => accumulator + parseFloat(utxo.amount) / adaInLovelaces,
        0
      );
      expect(sumUtxosAmount, 'returned amount is less than 5 ADA').to.be.at.least(5);
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
