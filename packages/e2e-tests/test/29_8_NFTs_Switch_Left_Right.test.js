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

describe('Switch between NFTs', function () {
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

  it('Switch right', async function () {
    const nftDetailsPage = new NftDetails(webdriver, logger);
    await nftDetailsPage.selectOverview();
    await nftDetailsPage.switchToNextNft();
    const nextNftName = await nftDetailsPage.getName();
    expect(nextNftName !== testNFT.name, 'The same name is displayed').to.be.true;
    const nextNftFingerprint = await nftDetailsPage.getFingerprint();
    expect(nextNftFingerprint !== testNFT.fingerprint, 'The same fingerprint is displayed').to.be.true;
  });

  it('Switch left', async function () {
    const nftDetailsPage = new NftDetails(webdriver, logger);
    await nftDetailsPage.selectOverview();
    await nftDetailsPage.switchToPreviousNft();
    const nftName = await nftDetailsPage.getName();
    expect(nftName, 'A wrong nft name is displayed').to.equal(testNFT.name);
    const fingerprint = await nftDetailsPage.getFingerprint();
    expect(fingerprint, 'A wrong nft fingerprint is displayed').to.equal(testNFT.fingerprint);
  });

  it('Switch left again', async function () {
    const nftDetailsPage = new NftDetails(webdriver, logger);
    await nftDetailsPage.selectOverview();
    await nftDetailsPage.switchToPreviousNft();
    const nextNftName = await nftDetailsPage.getName();
    expect(nextNftName !== testNFT.name, 'The same name is displayed').to.be.true;
    const nextNftFingerprint = await nftDetailsPage.getFingerprint();
    expect(nextNftFingerprint !== testNFT.fingerprint, 'The same fingerprint is displayed').to.be.true;
  });

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
