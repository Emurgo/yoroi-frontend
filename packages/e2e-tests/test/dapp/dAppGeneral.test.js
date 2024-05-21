import BasePage from '../../pages/basepage.js';
import { customAfterEach, customBeforeNestedDAppTest } from '../../utils/customHooks.js';
import { testWallet1 } from '../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../utils/utils.js';
import { oneMinute } from '../../helpers/timeConstants.js';
import { restoreWallet } from '../../helpers/restoreWalletHelper.js';
import { WindowManager, mockDAppName } from '../../helpers/windowManager.js';
import { getMockServer, mockDAppUrl } from '../../helpers/mock-dApp-webpage/mockServer.js';
import { MockDAppWebpage } from '../../helpers/mock-dApp-webpage/mockedDApp.js';
import { connectNonAuth } from '../../helpers/mock-dApp-webpage/dAppHelper.js';
import { adaInLovelaces } from '../../helpers/constants.js';
import driversPoolsManager from '../../utils/driversPool.js';

describe('dApp, general functions, without pop-up', function () {
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

  describe('[nested-dapp] Get balance', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Checking balance', async function () {
      const balanceResponse = await mockedDApp.getBalance();
      // it is necessary to do, because the wallet balance is returned in lovelaces
      // and as the String type
      expect(balanceResponse.success, 'The request getBalance failed').to.be.true;
      const expectedBalance = String(testWallet1.balance * adaInLovelaces);
      expect(balanceResponse.retValue).to.equal(expectedBalance, `Wrong balance`);
    });
  });

  describe('[nested-dapp] Get change address', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getChangeAddress', async function () {
      const changeAddressResponse = await mockedDApp.getChangeAddress();
      expect(changeAddressResponse.success, 'The request getChangeAddress failed').to.be.true;
      expect(changeAddressResponse.retValue).to.be.an('string').that.is.not.empty;
    });
  });

  describe('[nested-dapp] Get extensions', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Requet getExtensions', async function () {
      const extensionsResponse = await mockedDApp.getExtensions();
      expect(extensionsResponse.success, 'The request getExtensions failed').to.be.true;
      expect(extensionsResponse.retValue).to.be.an('array').that.is.not.empty;
      expect(extensionsResponse.retValue.length).to.equal(1);
      expect(extensionsResponse.retValue[0].cip).to.equal(95);
    });
  });

  describe('[nested-dapp] Get network ID', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getNetworkId', async function () {
      const networkIdResponse = await mockedDApp.getNetworkId();
      expect(networkIdResponse.success, 'The request getNetworkId failed').to.be.true;
      expect(networkIdResponse.retValue).to.be.an('number');
      expect(networkIdResponse.retValue).to.be.at.most(1);
    });
  });

  describe('[nested-dapp] Get reward address', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getRewardAddresses', async function () {
      const rewardAddressesResponse = await mockedDApp.getRewardAddresses();
      expect(rewardAddressesResponse.success, 'The request getRewardAddresses failed').to.be.true;
      expect(rewardAddressesResponse.retValue).to.be.an('array').that.is.not.empty;
    });
  });

  describe('[nested-dapp] Get unused addresses', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getUnusedAddresses', async function () {
      await mockedDApp.requestUnusedAddresses();
      const unusedAddressesResponse = await mockedDApp.getAddresses();
      expect(unusedAddressesResponse.success, 'The request getUnusedAddresses failed').to.be.true;
      expect(unusedAddressesResponse.retValue).to.be.an('array').that.is.not.empty;
    });
  });

  describe('[nested-dapp] Get used addresses', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getUsedAddresses', async function () {
      await mockedDApp.requestUsedAddresses();
      const usedAddressesResponse = await mockedDApp.getAddresses();
      expect(usedAddressesResponse.success, 'The request getUsedAddresses failed').to.be.true;
      expect(usedAddressesResponse.retValue).to.be.an('array').that.is.not.empty;
    });
  });

  describe('[nested-dapp] Get used addresses, big page parameter', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getUsedAddresses with too big page parameter', async function () {
      const page = 10;
      const limit = 5;
      await mockedDApp.requestUsedAddresses(page, limit);
      const usedAddressesResponse = await mockedDApp.getAddresses();
      expect(usedAddressesResponse.success, 'The request getUsedAddresses passed').to.be.false;
      const responseErrMsg = usedAddressesResponse.errMsg;
      expect(responseErrMsg.maxSize).to.be.at.least(1);
    });
  });

  describe('[nested-dapp] CIP-95, get public DRep key', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getPubDRepKey', async function () {
      const extensionsResponse = await mockedDApp.getPubDRepKey();
      expect(extensionsResponse.success, 'The request getExtensions failed').to.be.true;
      expect(extensionsResponse.retValue).to.be.an('string').that.is.not.empty;
    });
  });

  describe('[nested-dapp] CIP-95, get registered public stake key', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getRegisteredPubStakeKeys', async function () {
      const extensionsResponse = await mockedDApp.getRegisteredPubStakeKeys();
      expect(extensionsResponse.success, 'The request getRegisteredPubStakeKeys failed').to.be
        .true;
      // update it when the SanchoNet is released
      expect(extensionsResponse.retValue).to.be.an('array');
    });
  });

  describe('[nested-dapp] CIP-95, get unregistered public stake key', function () {
    before(async function () {
      await customBeforeNestedDAppTest(this, windowManager);
    });

    it('Request getUnregisteredPubStakeKeys', async function () {
      const extensionsResponse = await mockedDApp.getUnregisteredPubStakeKeys();
      expect(extensionsResponse.success, 'The request getUnregisteredPubStakeKeys failed').to.be
        .true;
      // update it when the SanchoNet is released
      expect(extensionsResponse.retValue).to.be.an('array').that.is.not.empty;
      expect(extensionsResponse.retValue.length).to.equal(1);
      expect(extensionsResponse.retValue[0]).to.be.an('string').that.is.not.empty;
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
