import { expect } from 'chai';
import BasePage from '../pages/basepage.js';
import driversPoolsManager from '../utils/driversPool.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import ReceiveSubTab from '../pages/wallet/walletTab/receiveSubTab.page.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { getRewarKeyHashFromBech32 } from '../helpers/mock-dApp-webpage/dAppTxHelper.js';
import { preloadDBAndStorage, waitTxPage } from '../helpers/restoreWalletHelper.js';

describe('Verify addresses', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  let bech32StakeAddress = '';
  let stakingKeyHexExp = '';

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await preloadDBAndStorage(webdriver, logger, 'testWallet1');
    await waitTxPage(webdriver, logger);
  });

  it('Open the Receive tab', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.goToReceiveSubMenu();
  });

  it('Get staking key hash', async function () {
    const receivePage = new ReceiveSubTab(webdriver, logger);
    await receivePage.selectRewardAddrs();
    // there is only one stake address, that it is why the ubdex is 0
    bech32StakeAddress = (await receivePage.getAddressInfo(0)).addressFull;
    expect(bech32StakeAddress)
      .to.be.a('string')
      .and.satisfy(msg => msg.startsWith('stake1'));
    stakingKeyHexExp = getRewarKeyHashFromBech32(bech32StakeAddress);
  });

  it('Check base external addresses', async function () {
    const receivePage = new ReceiveSubTab(webdriver, logger);
    await receivePage.selectBaseExtAllAddrs();
    const addressesAmount = await receivePage.getAmountOfAddresses();
    for (let addressIndex = 0; addressIndex < addressesAmount; addressIndex++) {
      const addressInfo = await receivePage.getAddressInfo(addressIndex);
      const verifyAddresModalPage = await receivePage.callVerifyAddress(addressIndex);
      const modalIsDisplayed = await verifyAddresModalPage.isDisplayed();
      expect(modalIsDisplayed, 'Verify address modal is not displayed').to.be.true;
      const verifyInfo = await verifyAddresModalPage.getVerifyAddressInfo();
      expect(verifyInfo.addressFull, 'Full address is different').to.equal(addressInfo.addressFull);
      expect(verifyInfo.derivationPath, 'Derivation path is diffirent').to.match(
        /m\/1852'\/1815'\/0'\/0\/\d+/gi
      );
      expect(verifyInfo.stakingKeyHash, 'Staking key hash is different').to.equal(stakingKeyHexExp);
      await verifyAddresModalPage.closeModal();
    }
  });

  it('Check base internal addresses', async function () {
    const receivePage = new ReceiveSubTab(webdriver, logger);
    await receivePage.selectBaseInterAllAddrs();
    const addressesAmount = await receivePage.getAmountOfAddresses();
    for (let addressIndex = 0; addressIndex < addressesAmount; addressIndex++) {
      const addressInfo = await receivePage.getAddressInfo(addressIndex);
      const verifyAddresModalPage = await receivePage.callVerifyAddress(addressIndex);
      const modalIsDisplayed = await verifyAddresModalPage.isDisplayed();
      expect(modalIsDisplayed, 'Verify address modal is not displayed').to.be.true;
      const verifyInfo = await verifyAddresModalPage.getVerifyAddressInfo();
      expect(verifyInfo.addressFull, 'Full address is different').to.equal(addressInfo.addressFull);
      expect(verifyInfo.derivationPath, 'Derivation path is diffirent').to.match(
        /m\/1852'\/1815'\/0'\/1\/\d+/gi
      );
      expect(verifyInfo.stakingKeyHash, 'Staking key hash is different').to.equal(stakingKeyHexExp);
      await verifyAddresModalPage.closeModal();
    }
  });

  it('Check reward address', async function () {
    const receivePage = new ReceiveSubTab(webdriver, logger);
    await receivePage.selectRewardAddrs();
    const addressesAmount = await receivePage.getAmountOfAddresses();
    for (let addressIndex = 0; addressIndex < addressesAmount; addressIndex++) {
      const addressInfo = await receivePage.getAddressInfo(addressIndex);
      const verifyAddresModalPage = await receivePage.callVerifyAddress(addressIndex);
      const modalIsDisplayed = await verifyAddresModalPage.isDisplayed();
      expect(modalIsDisplayed, 'Verify address modal is not displayed').to.be.true;
      const verifyInfo = await verifyAddresModalPage.getVerifyAddressInfo(true);
      expect(verifyInfo.addressFull, 'Full address is different').to.equal(addressInfo.addressFull);
      expect(verifyInfo.derivationPath, 'Derivation path is diffirent').to.match(
        /m\/1852'\/1815'\/0'\/2\/\d+/gi
      );
    }
  });

  afterEach(function (done) {
    customAfterEach(this, webdriver, logger);
    done();
  });

  after(function (done) {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
    done();
  });
});
