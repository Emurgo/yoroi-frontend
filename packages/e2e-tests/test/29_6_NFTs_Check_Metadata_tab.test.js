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
import { parseNftMetadata } from '../helpers/nftHelper.js';

describe('Check the Metadata tab', function () {
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

  it('Check metadata details', async function () {
    const nftDetailsPage = new NftDetails(webdriver, logger);
    await nftDetailsPage.selectMetadata();
    const displayedMetadata = await nftDetailsPage.getMetadata();
    const parsedMetadata = parseNftMetadata(displayedMetadata, testNFT.policyId, testNFT.name);

    expect(parsedMetadata.description, 'Incorrect description in metadata').to.equal(
      testNFT.description
    );
    expect(parsedMetadata.image, 'Incorrect image path in metadata').to.equal(testNFT.src);
    expect(parsedMetadata.name, 'Incorrect name in metadata').to.equal(testNFT.name);
    expect(parsedMetadata.tokenType, 'Incorrect token type in metadata').to.equal('nft');
    expect(parsedMetadata.totalSupply, 'Incorrect total supply in metadata').to.equal(1);
  });

  it('Check copying metadata', async function () {
    const nftDetailsPage = new NftDetails(webdriver, logger);
    await nftDetailsPage.selectMetadata();
    await nftDetailsPage.copyMetadata();
    const copiedMetadata = await nftDetailsPage.getClipboardData();
    const parsedMetadata = parseNftMetadata(copiedMetadata, testNFT.policyId, testNFT.name);

    expect(parsedMetadata.description, 'Incorrect description in copied metadata').to.equal(
      testNFT.description
    );
    expect(parsedMetadata.image, 'Incorrect image path in copied metadata').to.equal(testNFT.src);
    expect(parsedMetadata.name, 'Incorrect name in copied metadata').to.equal(testNFT.name);
    expect(parsedMetadata.tokenType, 'Incorrect token type in copied metadata').to.equal('nft');
    expect(parsedMetadata.totalSupply, 'Incorrect total supply in copied metadata').to.equal(1);
  });

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
