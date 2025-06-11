import { customAfterEach } from '../utils/customHooks.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import driversPoolsManager from '../utils/driversPool.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { oneMinute, quarterSecond } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import BasePage from '../pages/basepage.js';
import NftGalleryTab from '../pages/wallet/nftGallery/nftGalleryMain.page.js';
import WalletCommonBase from '../pages/walletCommonBase.page.js';

describe('Changing NFTs grid appearance', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  let initialNFTCardSize = {
    width: 0,
    height: 0,
  };
  const nftIndex = 0;

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
    initialNFTCardSize = await nftsMainPage.getNftCardSize(nftIndex);
    const fourColumnsViewIsSelected = await nftsMainPage.fourColumnsViewIsSelected();
    expect(fourColumnsViewIsSelected, 'Four columns view is not selected').to.be.true;
  });

  it('Set 6 column grid', async function () {
    const nftsMainPage = new NftGalleryTab(webdriver, logger);
    await nftsMainPage.setSixColumnsView();
    const newNftCardSize = await nftsMainPage.getNftCardSize(nftIndex);
    expect(
      newNftCardSize.height < initialNFTCardSize.height &&
        newNftCardSize.width < initialNFTCardSize.width,
      'NFT card width is different'
    ).to.be.true;
    const sixColumnsViewIsSelected = await nftsMainPage.sixColumnsViewIsSelected();
    expect(sixColumnsViewIsSelected, 'Six columns view is not selected').to.be.true;
  });

  it('Set 4 column grid', async function () {
    const nftsMainPage = new NftGalleryTab(webdriver, logger);
    await nftsMainPage.setFourColumnsView();
    const newNftCardSize = await nftsMainPage.getNftCardSize(nftIndex);
    expect(newNftCardSize.width, 'NFT card width is different').to.be.equal(
      initialNFTCardSize.width
    );
    expect(newNftCardSize.height, 'NFT card height is different').to.be.equal(
      initialNFTCardSize.height
    );
    const fourColumnsViewIsSelected = await nftsMainPage.fourColumnsViewIsSelected();
    expect(fourColumnsViewIsSelected, 'Four columns view is not selected').to.be.true;
  });

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
