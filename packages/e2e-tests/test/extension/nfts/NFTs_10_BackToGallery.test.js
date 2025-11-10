import { describe, it } from 'mocha';
import { customAfterEach } from '../../../utils/customHooks.js';
import { expect } from 'chai';
import { getRandomItem, getTestLogger } from '../../../utils/utils.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import NftGalleryTab from '../../../pages/wallet/nftGallery/nftGalleryMain.page.js';
import WalletCommonBase from '../../../pages/walletCommonBase.page.js';
import { testWalletNFTsAllNfts } from '../../../helpers/nftsInfo.js';
import NftDetails from '../../../pages/wallet/nftGallery/nftDetails.page.js';

describe('Return to Gallery', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {WalletCommonBase} */
  let walletCommonPage = null;
  /** @type {NftGalleryTab} */
  let nftsMainPage = null;
  /** @type {NftDetails} */
  let nftDetailsPage = null;
  const testNFT = getRandomItem(testWalletNFTsAllNfts);

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWalletNFTs', this);
    walletCommonPage = new WalletCommonBase(webdriver, logger);
    nftsMainPage = new NftGalleryTab(webdriver, logger);
    nftDetailsPage = new NftDetails(webdriver, logger);
  });

  it('Open NFTs Gallery', async function () {
    await walletCommonPage.goToNftsTab();
    const nftsPageIsDisplayed = await nftsMainPage.isDisplayed();
    expect(nftsPageIsDisplayed, 'NFTs Gallery page is not displayed').to.be.true;
  });

  it('Select NFT by name', async function () {
    const nftDetailsPage = await nftsMainPage.selectNftByName(testNFT.title);
    const detailsIsDisplayed = await nftDetailsPage.isDisplayed();
    expect(detailsIsDisplayed, 'NFT details page is not displayed').to.be.true;
  });

  it('Back to gallery', async function () {
    await nftDetailsPage.backToNftsGallery();
    const nftsPageIsDisplayed = await nftsMainPage.isDisplayed();
    expect(nftsPageIsDisplayed, 'NFTs Gallery page is not displayed').to.be.true;
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletCommonPage.closeBrowser();
  });
});
