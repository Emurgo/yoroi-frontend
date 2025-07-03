import { customAfterEach } from '../utils/customHooks.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import driversPoolsManager from '../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import BasePage from '../pages/basepage.js';
import NftGalleryTab from '../pages/wallet/nftGallery/nftGalleryMain.page.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';
import { getTestString } from '../helpers/constants.js';
import { testWalletNFTsAllNfts } from '../helpers/nftsInfo.js';

describe('Search NFTs no matches', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  const randomStr = getTestString('', 10, true);

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

  it('Check number of displayed NFTs', async function () {
    const nftsMainPage = new NftGalleryTab(webdriver, logger);
    const numberOfDisplayedNFTs = await nftsMainPage.countShownNfts();
    expect(numberOfDisplayedNFTs, 'Different amount of NFTs is displayed').to.equal(
      testWalletNFTsAllNfts.length
    );
  });

  it('Search for NFT by random value', async function () {
    const nftsMainPage = new NftGalleryTab(webdriver, logger);
    await nftsMainPage.search(randomStr);
  });

  it('Check search result', async function () {
    const nftsMainPage = new NftGalleryTab(webdriver, logger);
    const notFoundIsDisplayed = await nftsMainPage.noNftsAreFoundIsDisplayed();
    expect(notFoundIsDisplayed, 'The message "NFTs not found" is not dispayed').to.be.true;
  });

  it('Clean the search', async function () {
    const nftsMainPage = new NftGalleryTab(webdriver, logger);
    await nftsMainPage.clearSearch();
    const numberOfDisplayedNFTs = await nftsMainPage.countShownNfts();
    expect(numberOfDisplayedNFTs, 'Different amount of NFTs is displayed').to.equal(
      testWalletNFTsAllNfts.length
    );
  });

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
