import { expect } from 'chai';
import driversPoolsManager from '../../../utils/driversPool.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import ReceiveSubTab from '../../../pages/wallet/walletTab/receiveSubTab.page.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { getRewarKeyHashFromBech32 } from '../../../helpers/mock-dApp-webpage/dAppTxHelper.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Verify addresses', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {ReceiveSubTab} */
  let receivePage = null;
  let bech32StakeAddress = '';
  let stakingKeyHexExp = '';

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    receivePage = new ReceiveSubTab(webdriver, logger);
  });

  it('Open the Receive tab', async function () {
    await transactionsPage.goToReceiveSubMenu();
  });

  it('Get staking key hash', async function () {
    await receivePage.selectRewardAddrs();
    // there is only one stake address, that it is why the ubdex is 0
    bech32StakeAddress = (await receivePage.getAddressInfo(0)).addressFull;
    expect(bech32StakeAddress)
      .to.be.a('string')
      .and.satisfy(msg => msg.startsWith('stake_test1'));
    stakingKeyHexExp = getRewarKeyHashFromBech32(bech32StakeAddress);
  });

  it('Check base external addresses', async function () {
    await receivePage.selectBaseExtAllAddrs();
    const addressesAmount = await receivePage.getAmountOfAddresses();
    for (let addressIndex = 0; addressIndex < addressesAmount; addressIndex++) {
      const addressInfo = await receivePage.getAddressInfo(addressIndex);
      const verifyAddresModalPage = await receivePage.callVerifyAddress(addressIndex);
      const modalIsDisplayed = await verifyAddresModalPage.isDisplayed();
      expect(modalIsDisplayed, 'Verify address modal is not displayed').to.be.true;
      const verifyInfo = await verifyAddresModalPage.getVerifyAddressInfo();
      expect(verifyInfo.addressFull, 'Full address is different').to.equal(addressInfo.addressFull);
      expect(verifyInfo.derivationPath, 'Derivation path is diffirent').to.match(/m\/1852'\/1815'\/0'\/0\/\d+/gi);
      expect(verifyInfo.stakingKeyHash, 'Staking key hash is different').to.equal(stakingKeyHexExp);
      await verifyAddresModalPage.closeModal();
    }
  });

  it('Check base internal addresses', async function () {
    await receivePage.selectBaseInterAllAddrs();
    const addressesAmount = await receivePage.getAmountOfAddresses();
    for (let addressIndex = 0; addressIndex < addressesAmount; addressIndex++) {
      const addressInfo = await receivePage.getAddressInfo(addressIndex);
      const verifyAddresModalPage = await receivePage.callVerifyAddress(addressIndex);
      const modalIsDisplayed = await verifyAddresModalPage.isDisplayed();
      expect(modalIsDisplayed, 'Verify address modal is not displayed').to.be.true;
      const verifyInfo = await verifyAddresModalPage.getVerifyAddressInfo();
      expect(verifyInfo.addressFull, 'Full address is different').to.equal(addressInfo.addressFull);
      expect(verifyInfo.derivationPath, 'Derivation path is diffirent').to.match(/m\/1852'\/1815'\/0'\/1\/\d+/gi);
      expect(verifyInfo.stakingKeyHash, 'Staking key hash is different').to.equal(stakingKeyHexExp);
      await verifyAddresModalPage.closeModal();
    }
  });

  it('Check reward address', async function () {
    await receivePage.selectRewardAddrs();
    const addressesAmount = await receivePage.getAmountOfAddresses();
    for (let addressIndex = 0; addressIndex < addressesAmount; addressIndex++) {
      const addressInfo = await receivePage.getAddressInfo(addressIndex);
      const verifyAddresModalPage = await receivePage.callVerifyAddress(addressIndex);
      const modalIsDisplayed = await verifyAddresModalPage.isDisplayed();
      expect(modalIsDisplayed, 'Verify address modal is not displayed').to.be.true;
      const verifyInfo = await verifyAddresModalPage.getVerifyAddressInfo(true);
      expect(verifyInfo.addressFull, 'Full address is different').to.equal(addressInfo.addressFull);
      expect(verifyInfo.derivationPath, 'Derivation path is diffirent').to.match(/m\/1852'\/1815'\/0'\/2\/\d+/gi);
    }
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
