import { fiveSeconds, quarterSecond } from '../../../helpers/timeConstants.js';
import { ElementLocator } from '../../locator.js';
import WalletCommonBase from '../../walletCommonBase.page.js';

export default class NftDetails extends WalletCommonBase {
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
    locator: 'nftDetails:overview-explorer-link',
    method: 'id',
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
  /**
   * Checking the NFT details page is displayed
   * @returns {Promise<boolean>}
   */
  async isDisplayed() {
    this.logger.info(`NftDetails::isDisplayed is called`);
    const backBtnPromise = this.customWaitIsPresented(
      this.backNFTsGalleryBtnLocator,
      fiveSeconds,
      quarterSecond
    );
    const nextBtnPromise = this.customWaitIsPresented(
      this.nextNftBtnLocator,
      fiveSeconds,
      quarterSecond
    );
    const nftNamePromise = this.customWaitIsPresented(
      this.nftNameLocator,
      fiveSeconds,
      quarterSecond
    );
    const [backBtnState, nextBtnState, nftNameState] = await Promise.all([
      backBtnPromise,
      nextBtnPromise,
      nftNamePromise,
    ]);

    return backBtnState && nextBtnState && nftNameState;
  }
  /**
   * Clicking the button "Back to gallery"
   */
  async backToNftsGallery() {
    this.logger.info(`NftDetails::backToNftsGallery is called`);
    await this.click(this.backNFTsGalleryBtnLocator);
  }
  /**
   * Getting a NFT name shown on the details page
   * @returns {Promise<string>}
   */
  async getName() {
    this.logger.info(`NftDetails::getName is called`);
    return await this.getText(this.nftNameLocator);
  }
  /**
   * Switching to the next NFT
   */
  async switchToNextNft() {
    this.logger.info(`NftDetails::switchToNextNft is called`);
    await this.click(this.nextNftBtnLocator);
  }
  /**
   * Switching to the previous NFT
   */
  async switchToPreviousNft() {
    this.logger.info(`NftDetails::switchToPreviousNft is called`);
    await this.click(this.prevNftBtnLocator);
  }
  /**
   * Selecting the Overview tab on the NFT Details page
   */
  async selectOverview() {
    this.logger.info(`NftDetails::selectOverview is called`);
    await this.click(this.overviewTabBtnLocator);
  }
  /**
   * Selecting the Metadata tab on the NFT Details page
   */
  async selectMetadata() {
    this.logger.info(`NftDetails::selectMetadata is called`);
    await this.click(this.metadataTabBtnLocator);
  }
  /**
   * Getting NFT's description
   * @returns {Promise<string>}
   */
  async getDescription() {
    this.logger.info(`NftDetails::getDescription is called`);
    return await this.getText(this.overviewDescriptionTextLocator);
  }
  /**
   * Getting NFT's author
   * @returns {Promise<string>}
   */
  async getAuthor() {
    this.logger.info(`NftDetails::getAuthor is called`);
    return await this.getText(this.overviewAuthorTextLocator);
  }
  /**
   * Getting NFT's fingerprint
   * @returns {Promise<string>}
   */
  async getFingerprint() {
    this.logger.info(`NftDetails::getFingerprint is called`);
    return await this.getText(this.overviewFingerPrintTextLocator);
  }
  /**
   * Copying a nft fingerprint by pressing the copy button
   */
  async copyFingerprint() {
    this.logger.info(`NftDetails::copyFingerprint is called`);
    await this.click(this.overviewFingerPrintCopyBtnLocator);
  }
  /**
   * Getting NFT's policy ID
   * @returns {Promise<string>}
   */
  async getPolicyId() {
    this.logger.info(`NftDetails::getPolicyId is called`);
    return await this.getText(this.overviewPolicyIdTextLocator);
  }
  /**
   * Copying a nft polyci ID by pressing the copy button
   */
  async copyPolicyId() {
    this.logger.info(`NftDetails::copyPolicyId is called`);
    await this.click(this.overviewPolicyIdCopyBtnLocator);
  }
  /**
   * Getting full displayed NFT's info
   * @returns {Promise<{author: string, description: string, fingerprint: string, policyId: string}>}
   */
  async getNftInfo() {
    this.logger.info(`NftDetails::getNftInfo is called`);
    const description = await this.getDescription();
    const author = await this.getAuthor();
    const fingerprint = await this.getFingerprint();
    const policyId = await this.getPolicyId();
    return {
        author,
        description,
        fingerprint,
        policyId
    }
  }
  /**
   * Getting the explorer URL
   * @returns {Promise<string>}
   */
  async getExplorerLink() {
    this.logger.info(`NftDetails::getExplorerLink is called`);
    const linkText = await this.getLinkFromComponent(this.overviewExplorerLinkLocator)
    this.logger.info(`NftDetails::getExplorerLink. Result: ${linkText}`);
    return linkText;
  }
  /**
   * Copying a nft metadata by pressing the copy button
   */
  async copyMetadata() {
    this.logger.info(`NftDetails::copyMetadata is called`);
    await this.click(this.metadataCopyBtnLocator);
  }
  /**
   * Getting NFT's metadata
   * @returns {Promise<string>}
   */
  async getMetadata() {
    this.logger.info(`NftDetails::getMetadata is called`);
    return await this.getText(this.metadataInfoTextLocator);
  }
}
