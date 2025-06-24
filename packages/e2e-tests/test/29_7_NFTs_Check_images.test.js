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
import { isImageIdsSame } from '../helpers/nftHelper.js';

describe('Check the NFT image links', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  const testNFT = getRandomItem(testWalletNFTsAllNfts);
  let initialImageLink = '';

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

  it('Get NFT image link by name', async function () {
    const nftsMainPage = new NftGalleryTab(webdriver, logger);
    const nftImageLink = await nftsMainPage.getImageLinkByName(testNFT.name);
    const compareResult = isImageIdsSame(nftImageLink, testNFT.src);
    expect(compareResult, 'Image Id is different from the expected').to.be.true;
    initialImageLink = nftImageLink;
  });

  it('Check image link on NFT Details', async function () {
    const nftsMainPage = new NftGalleryTab(webdriver, logger);
    const nftDetailsPage = await nftsMainPage.selectNftByName(testNFT.name);
    const detailsIsDisplayed = await nftDetailsPage.isDisplayed();
    expect(detailsIsDisplayed, 'NFT details page is not displayed').to.be.true;
    const nftDetailsImageLink = await nftDetailsPage.getImageLink();
    expect(nftDetailsImageLink, 'Image link is different').to.equal(initialImageLink);
  });

  it('Check zoomed image', async function () {
    const nftDetailsPage = new NftDetails(webdriver, logger);
    await nftDetailsPage.zoomImage();
    const nftDetailsImageLink = await nftDetailsPage.getZoomedImageLink();
    expect(nftDetailsImageLink, 'Image link is different').to.equal(initialImageLink);
  });

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
