import { describe, it } from 'mocha';
import { customAfterEach } from '../utils/customHooks.js';
import { expect } from 'chai';
import { getRandomItem, getTestLogger } from '../utils/utils.js';
import driversPoolsManager from '../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import BasePage from '../pages/basepage.js';
import NftGalleryTab from '../pages/wallet/nftGallery/nftGalleryMain.page.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import { testWalletNFTsAllNfts } from '../helpers/nftsInfo.js';
import NftDetails from '../pages/wallet/nftGallery/nftDetails.page.js';

describe('Check the Overview tab', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  const testNFT = getRandomItem(testWalletNFTsAllNfts);

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWalletNFTs', this);
  });

  it('Open NFTs Gallery', async function () {
    const walletCommonPage = new WalletCommonBase(webdriver, logger);
    await walletCommonPage.goToNftsTab();
    const nftsMainPage = new NftGalleryTab(webdriver, logger);
    const nftsPageIsDisplayed = await nftsMainPage.isDisplayed();
    expect(nftsPageIsDisplayed, 'NFTs Gallery page is not displayed').to.be.true;
  });

  it('Select NFT by name', async function () {
    const nftsMainPage = new NftGalleryTab(webdriver, logger);
    const nftDetailsPage = await nftsMainPage.selectNftByName(testNFT.name);
    const detailsIsDisplayed = await nftDetailsPage.isDisplayed();
    expect(detailsIsDisplayed, 'NFT details page is not displayed').to.be.true;
  });

  it('Check overview details', async function () {
    const nftDetailsPage = new NftDetails(webdriver, logger);
    await nftDetailsPage.selectOverview();

    const displayedNftName = await nftDetailsPage.getName();
    expect(displayedNftName, 'A wrong name is displayed on NFT details page').to.equal(testNFT.name);
    const nftDescription = await nftDetailsPage.getDescription();
    expect(nftDescription, 'A wrong description is displayed on NFT details page').to.equal(testNFT.description);
    const nftFingerprint = await nftDetailsPage.getFingerprint();
    expect(nftFingerprint, 'A wrong fingerprint is displayed on NFT details page').to.equal(testNFT.fingerprint);
    const nftPolicyId = await nftDetailsPage.getPolicyId();
    expect(nftPolicyId, 'A wrong policyId is displayed on NFT details page').to.equal(testNFT.policyId);
  });

  it('Check copying fingerprint', async function () {
    const nftDetailsPage = new NftDetails(webdriver, logger);
    await nftDetailsPage.selectOverview();
    await nftDetailsPage.copyFingerprint();
    const copiedFingerprint = await nftDetailsPage.getClipboardData();
    expect(copiedFingerprint, 'A wrong fingerprint is copied on NFT details page').to.equal(testNFT.fingerprint);
  });

  it('Check copying policyId', async function () {
    const nftDetailsPage = new NftDetails(webdriver, logger);
    await nftDetailsPage.selectOverview();
    await nftDetailsPage.copyPolicyId();
    const copiedPolicyId = await nftDetailsPage.getClipboardData();
    expect(copiedPolicyId, 'A wrong policyId is copied on NFT details page').to.equal(testNFT.policyId);
  });

  it('Check explorer URL', async function () {
    const nftDetailsPage = new NftDetails(webdriver, logger);
    await nftDetailsPage.selectOverview();
    const explorerLink = await nftDetailsPage.getExplorerLink();
    const [domain, tokenRoute, policyAndName] = explorerLink.slice(8).split('/');
    expect(domain, 'Wrong domain is displayed').to.equal('preprod.cardanoscan.io');
    expect(tokenRoute, 'Wrong route is displayed').to.equal('token');
    const combinedPolicyAndName = testNFT.policyId + testNFT.nameHex;
    expect(policyAndName, 'Wrong NFT link is displayed').to.equal(combinedPolicyAndName);
  });


  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
