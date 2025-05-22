import WalletCommonBase from '../../walletCommonBase.page.js';
import { pageTitle } from '../../../helpers/pageTitles.js';
import { fiveSeconds, quarterSecond } from '../../../helpers/timeConstants.js';
import { ElementLocator } from '../../locator.js';
import { NO_NFTS_ADDED, NO_NFTS_FOUND } from '../../../helpers/messages.js';

class NftGalleryTab extends WalletCommonBase {
  // locators
  /** @type {ElementLocator} */
  nftsCountTextLocator = {
    locator: 'nftsList-nftsCount-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  searchInputLocator = {
    locator: 'nftsList-search-input',
    method: 'id',
  };
  /** @type {ElementLocator} */
  clearSearchBtnLocator = {
    locator: 'nftsList:search-clear-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  fourColumnViewBtnLocator = {
    locator: 'nftsList-4_columnView-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  sixColumnViewBtnLocator = {
    locator: 'nftsList-6_columnView-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  noNftsTextLocator = {
    locator: 'nftsList-noNfts-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  noNftsFoundImageLocator = {
    locator: '#nftsList-emptyState-component > svg',
    method: 'css',
  };
  /**
   * getting locator of a NFT by a NFT index
   * @param {number} nftIndex
   * @returns {ElementLocator}
   */
  getNftButtonLocator = nftIndex => {
    return {
      locator: `nftsList:nft_${nftIndex}-component-button`,
      method: 'id',
    };
  };
  /**
   * getting locator of a NFT by its name
   * @param {number} nftIndex
   * @returns {ElementLocator}
   */
  getNftNameLocator = nftIndex => {
    return {
      locator: `nftsList:nft_${nftIndex}-name-text`,
      method: 'id',
    };
  };
  /**
   * getting locator of a NFT image by a NFT index
   * @param {number} nftIndex
   * @returns {ElementLocator}
   */
  getNftImageLocator = nftIndex => {
    return {
      locator: `nftsList:nft_${nftIndex}-image-component`,
      method: 'id',
    };
  };
  // methods
  /**
   * Checking the NFTs gallery page is displayed
   * @returns {Promise<boolean>}
   */
  async isDisplayed() {
    this.logger.info(`NftGalleryTab::isDisplayed is called`);
    const titleIsCorrectPromise = this.titleIsCorrect(pageTitle.nfts);
    const counterTitleIsDisplayedPromise = this.customWaitIsPresented(
      this.nftsCountTextLocator,
      fiveSeconds,
      quarterSecond
    );
    const searchIsDisplayedPromise = this.customWaitIsPresented(
      this.nftsCountTextLocator,
      fiveSeconds,
      quarterSecond
    );
    const [titleState, counterState, searchState] = await Promise.all([
      titleIsCorrectPromise,
      counterTitleIsDisplayedPromise,
      searchIsDisplayedPromise,
    ]);

    return titleState && counterState && searchState;
  }
  /**
   * Checking no NFTs screen is displayed
   * @returns {Promise<boolean>}
   */
  async noNftsIsDisplayed() {
    this.logger.info(`NftGalleryTab::noNftsIsDisplayed is called`);
    const counterText = await this.getText(this.nftsCountTextLocator);
    const counterArray = counterText.split(' ');
    const noNftsText = await this.getText(this.noNftsTextLocator);
    const noNftsImageIsDisplayed = await this.customWaitIsPresented(
      this.noNftsFoundImageLocator,
      fiveSeconds,
      quarterSecond
    );

    return counterArray.length === 1 && noNftsText === NO_NFTS_ADDED && noNftsImageIsDisplayed;
  }
  /**
   * Checking No NFTs found screen is displayed
   * @returns {Promise<boolean>}
   */
  async noNftsAreFoundIsDisplayed() {
    this.logger.info(`NftGalleryTab::noNftsAreFoundIsDisplayed is called`);
    const noNftsText = await this.getText(this.noNftsTextLocator);
    const noNftsImageIsDisplayed = await this.customWaitIsPresented(
      this.noNftsFoundImageLocator,
      fiveSeconds,
      quarterSecond
    );

    return noNftsText === NO_NFTS_FOUND && noNftsImageIsDisplayed;
  }
  /**
   * Getting a number of NFTs from the page title
   * @returns {Promise<number>}
   */
  async getNftsAmountFromTitle() {
    this.logger.info(`NftGalleryTab::getNftsAmountFromTitle is called`);
    const counterText = await this.getText(this.nftsCountTextLocator);
    const counterArray = counterText.split(' ');
    if (counterArray.length === 1) {
      return 0;
    }
    const counterNumberinStr = counterArray[1].match(/\((\d+)\)/)[1];
    return parseInt(counterNumberinStr);
  }
  /**
   * Selecting appearance NFTs in 4 rows
   * @returns {Promise<void>}
   */
  async setFourColumnsView() {
    this.logger.info(`NftGalleryTab::setFourColumnsView is called`);
  }
  /**
   * Selecting appearance NFTs in 6 rows
   * @returns {Promise<void>}
   */
  async setSixColumnsView() {
    this.logger.info(`NftGalleryTab::setSixColumnsView is called`);
  }
  /**
   * Searching for a NFT
   * @param {string} searchValue
   * @returns {Promise<void>}
   */
  async search(searchValue) {
    this.logger.info(`NftGalleryTab::search is called. Search value: "${searchValue}"`);
  }
  /**
   * Clearing the search input by pressing on the cross button
   * @returns {Promise<void>}
   */
  async clearSearch() {
    this.logger.info(`NftGalleryTab::clearSearch is called.`);
  }
  /**
   * Counting displayed NFTs
   * @returns {Promise<number>}
   */
  async countShownNfts() {
    this.logger.info(`NftGalleryTab::countShownNfts is called.`);
  }
  /**
   * Getting a NFT name by a NFT's index
   * @param {number} nftIndex
   * @returns {Promise<string>}
   */
  async getNftName(nftIndex) {
    this.logger.info(`NftGalleryTab::getNftName is called. NFT's index: ${nftIndex}`);
  }
  /**
   * Selecting a NFT by its index
   * @param {number} nftIndex
   * @returns {Promise<void>}
   */
  async selectNftByIndex(nftIndex) {
    this.logger.info(`NftGalleryTab::selectNftByIndex is called. NFT's index: ${nftIndex}`);
  }
  /**
   * Selecting a NFT by its name
   * @param {string} nftName
   */
  async selectNftByName(nftName) {
    this.logger.info(`NftGalleryTab::selectNftByName is called. NFT's name: ${nftName}`);
  }
}

export default NftGalleryTab;
