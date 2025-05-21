import WalletCommonBase from '../../walletCommonBase.page.js';

class NftGalleryTab extends WalletCommonBase {
  // locators
  nftsCountTextLocator = {
    locator: 'nftsList-nftsCount-text',
    method: 'id',
  }
  searchInputLocator = {
    locator: 'nftsList-search-input',
    method: 'id',
  }
  clearSearchBtnLocator = {
    locator: 'nftsList:search-clear-button',
    method: 'id',
  }
  fourColumnViewBtnLocator = {
    locator: 'nftsList-4_columnView-button',
    method: 'id',
  }
  sixColumnViewBtnLocator = {
    locator: 'nftsList-6_columnView-button',
    method: 'id',
  }
  noNftsTextLocator = {
    locator: 'nftsList-noNfts-text',
    method: 'id',
  }
  noNftsFoundImageLocator = {
    locator: '#nftsList-emptyState-component > svg',
    method: 'css',
  }
  // methods
  // * isDisplayed
  // * noNftsIsDisplayed
  // * get nfts amount from title
  // * switch to 4 columns view
  // * switch to 6 columns view
  // * search
  // * clear search
}

export default NftGalleryTab;
