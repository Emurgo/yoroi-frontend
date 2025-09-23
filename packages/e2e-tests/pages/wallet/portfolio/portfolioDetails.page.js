import WalletCommonBase from '../../walletCommonBase.page.js';
import { ElementLocator } from '../../locator.js';

export default class PortfolioTokenDetails extends WalletCommonBase {
  // locators
  /** @type {ElementLocator} */
  swapBtnLocator = {
    locator: 'portfolio:tokenDetails-swap-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  sendBtnLocator = {
    locator: 'portfolio:tokenDetails-send-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  receiveBtnLocator = {
    locator: 'portfolio:tokenDetails-receive-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  backBtnLocator = {
    locator: 'portfolio:tokenDetails-back-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  mainBalanceValueLocator = {
    locator: 'portfolio:tokenDetails:tokenBalance:main-value-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  mainBalanceFiatLocator = {
    locator: 'portfolio:tokenDetails:tokenBalance:main-fiat-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  secondBalanceLocator = {
    locator: 'portfolio:tokenDetails:tokenBalance-second-text',
    method: 'id',
  };
  // token market price
  /** @type {ElementLocator} */
  marketPriceMainValueLocator = {
    locator: 'portfolio:tokenDetails:marketPrice:price-value-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  marketPriceMainFiatLocator = {
    locator: 'portfolio:tokenDetails:marketPrice:price-fiat-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  pricePercentageChangeLocator = {
    locator: 'portfolio:tokenDetails:marketPrice-pricePercentageChange-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  priceValueChangeLocator = {
    locator: 'portfolio:tokenDetails:marketPrice-priceValueChange-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  graphLocator = {
    locator: 'portfolio:tokenDetails:marketPrice-graph-box',
    method: 'id',
  };
  /** @type {ElementLocator} */
  tokenNameLocator = {
    locator: 'portfolio:tokenDetails:overview-tokenName-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  tokenInfoLocator = {
    locator: 'portfolio:tokenDetails:overview-info-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  tokenWebsiteLinkLocator = {
    locator: 'portfolio:tokenDetails:overview-website-link',
    method: 'id',
  };
  /** @type {ElementLocator} */
  tokenPolicyIdTextLocator = {
    locator: 'portfolio:tokenDetails:overview-policyID-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  tokenPolicyIdCopyBtnLocator = {
    locator: 'portfolio:tokenDetails:overview:policyID-copy-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  tokenFingerprintTextLocator = {
    locator: 'portfolio:tokenDetails:overview-fingerprint-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  tokenFingerprintCopyBtn = {
    locator: 'portfolio:tokenDetails:overview:fingerprint-copy-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  tokenDetailsLinkLocator = {
    locator: 'portfolio:tokenDetails:overview-detailsOn-link',
    method: 'id',
  };
  // methods
}
