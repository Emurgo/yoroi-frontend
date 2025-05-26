import { ElementLocator } from '../../locator.js';
import WalletCommonBase from '../../walletCommonBase.page.js';

class NftDetails extends WalletCommonBase {
  // locators
  /** @type {ElementLocator} */
  backNFTsGalleryBtnLocator = {
    locator: 'nftDetails-backToGallery-button',
    method: 'id',
  };
  /**@type {ElementLocator} */
  nftNameLocator = {
    locator: 'nftDetails-nftName-text',
    method: 'id',
  };
  /**@type {ElementLocator} */
  nftImageLocator = {
    locator: 'nftDetails-image-component',
    method: 'id',
  };
  /**@type {ElementLocator} */
  nftTemplateImageLocator = {
    locator: '#nftDetails-image-component > svg',
    method: 'css',
  };
  /**@type {ElementLocator} */
  nextNftBtnLocator = {
    locator: 'nftDetails-nextNFT-button',
    method: 'id',
  };
  /**@type {ElementLocator} */
  prevNftBtnLocator = {
    locator: 'nftDetails-previousNFT-button',
    method: 'id',
  };
  /**@type {ElementLocator} */
  // probably will need to do it by document.querySelector
  // document.querySelector("button:has(#nftDetails-overviewTab-text)")
  overviewTabBtnLocator = {
    locator: 'button:has(#nftDetails-overviewTab-text)',
    method: 'css',
  };
  /**@type {ElementLocator} */
  // probably will need to do it by document.querySelector
  // document.querySelector("button:has(#nftDetails-metadataTab-text)")
  metadataTabBtnLocator = {
    locator: 'button:has(#nftDetails-metadataTab-text)',
    method: 'css',
  };
  /**@type {ElementLocator} */
  overviewDescriptionTextLocator = {
    locator: 'nftDetails:overview-description-text',
    method: 'id',
  };
  /**@type {ElementLocator} */
  overviewAuthorTextLocator = {
    locator: 'nftDetails:overview-author-text',
    method: 'id',
  };
  /**@type {ElementLocator} */
  overviewFingerPrintTextLocator = {
    locator: 'nftDetails:overview:fingerprint-info-text',
    method: 'id',
  };
  /**@type {ElementLocator} */
  overviewFingerPrintCopyBtnLocator = {
    locator: 'nftDetails:overview:fingerprint-copy-button',
    method: 'id',
  };
  /**@type {ElementLocator} */
  overviewPolicyIdTextLocator = {
    locator: 'nftDetails:overview:policyId-info-text',
    method: 'id',
  };
  /**@type {ElementLocator} */
  overviewPolicyIdCopyBtnLocator = {
    locator: 'nftDetails:overview:policyId-copy-button',
    method: 'id',
  };
  /**@type {ElementLocator} */
  overviewExplorerLinkLocator = {
    locator: '#nftDetails:overview-explorer-link > a',
    method: 'css',
  };
  /**@type {ElementLocator} */
  metadataCopyBtnLocator = {
    locator: 'nftDetails:metadata-copy-button',
    method: 'id',
  };
  /**@type {ElementLocator} */
  metadataInfoTextLocator = {
    locator: 'nftDetails:metadata-info-text',
    method: 'id',
  };
  // methods
}

export default NftDetails;
