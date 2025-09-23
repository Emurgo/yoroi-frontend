import WalletCommonBase from '../../walletCommonBase.page.js';
import { ElementLocator } from '../../locator.js';
import { fiveSeconds, oneSecond, quarterSecond } from '../../../helpers/timeConstants.js';
import { strNumberToNumber } from '../../../utils/utils.js';
import { Colors } from '../../../helpers/constants.js';

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
  marketPriceValueLocator = {
    locator: 'portfolio:tokenDetails:marketPrice:price-value-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  marketPriceFiatLocator = {
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
  async isDisplayed() {
    this.logger.info(`PortfolioTokenDetails::isDisplayed is called`);
    const states = await Promise.all([
      this.customWaitIsPresented(this.backBtnLocator, fiveSeconds, quarterSecond),
      this.customWaitIsPresented(this.mainBalanceValueLocator, fiveSeconds, quarterSecond),
      this.customWaitIsPresented(this.graphLocator, fiveSeconds, quarterSecond),
      this.customWaitIsPresented(this.tokenNameLocator, fiveSeconds, quarterSecond),
    ]);

    return states.every(state => state === true);
  }
  async clickBack() {
    this.logger.info(`PortfolioTokenDetails::clickBack is called`);
    await this.click(this.backBtnLocator);
  }
  async clickSwap() {
    this.logger.info(`PortfolioTokenDetails::clickSwap is called`);
    await this.click(this.swapBtnLocator);
  }
  async clickSend() {
    this.logger.info(`PortfolioTokenDetails::clickSend is called`);
    await this.click(this.sendBtnLocator);
  }
  async clickReceive() {
    this.logger.info(`PortfolioTokenDetails::clickReceive is called`);
    await this.click(this.receiveBtnLocator);
  }
  async getMainBalance() {
    this.logger.info(`PortfolioTokenDetails::getMainBalance is called`);
    const [valueText, fiat] = await Promise.all([
      this.getText(this.mainBalanceValueLocator),
      this.getText(this.mainBalanceFiatLocator),
    ]);
    const value = strNumberToNumber(valueText);

    return { value, fiat };
  }
  async getSecondBalance() {
    this.logger.info(`PortfolioTokenDetails::getSecondBalance is called`);
    const secondBalanceRaw = await this.getText(this.secondBalanceLocator);
    const [valueText, fiat] = secondBalanceRaw.split(/\s/g);
    const value = strNumberToNumber(valueText);

    return { value, fiat };
  }
  async getMarketPrice() {
    this.logger.info(`PortfolioTokenDetails::getMarketPrice is called`);
    const [valueText, fiatRaw] = await Promise.all([
      this.getText(this.marketPriceValueLocator),
      this.getText(this.marketPriceFiatLocator),
    ]);
    const value = strNumberToNumber(valueText);
    const fiat = fiatRaw.trim();

    return { value, fiat };
  }
  async _defineSign(priceChangeLocator) {
    const color = await this.getCssValue(priceChangeLocator, 'color');
    return color === Colors.portfolioNegative ? '-' : '';
  }
  async _getChangeValue(priceLocator) {
    let priceChangeText = await this.getText(priceLocator);
    if (priceChangeText.endsWith('%')) {
      priceChangeText = priceChangeText.slice(0, priceChangeText.length - 1);
    }
    if (priceChangeText === '-') {
      return null;
    }
    const priceChangeSign = await this._defineSign(priceLocator);
    return strNumberToNumber(`${priceChangeSign}${priceChangeText}`);
  }
  async getPriceChange() {
    this.logger.info(`PortfolioTokenDetails::getMarketPrice is called`);
    const percentage = await this._getChangeValue(this.pricePercentageChangeLocator);
    const priceChangeRaw = await this.getText(this.priceValueChangeLocator);
    const [priceChangeText, fiat] = priceChangeRaw.split(/\s/g);
    let value = null;
    if (priceChangeText !== '-') {
      value = strNumberToNumber(priceChangeText);
    }

    return { percentage, priceChange: { value, fiat } };
  }
  async getTokenInfo() {
    this.logger.info(`PortfolioTokenDetails::getTokenInfo is called`);
    const name = await this.getText(this.tokenNameLocator);
    let description = await this.getText(this.tokenInfoLocator);
    if (description === '-') {
      description = null;
    }
    const websiteText = await this.getText(this.tokenWebsiteLinkLocator);
    let websiteLink = null;
    if (websiteText !== '-') {
      websiteLink = await this.getAttribute(this.tokenWebsiteLinkLocator, 'href');
    }
    const policyPresented = await this.customWaitIsPresented(this.tokenPolicyIdTextLocator, oneSecond, quarterSecond);
    let policyId = null;
    if (policyPresented) {
      policyId = await this.getText(this.tokenPolicyIdTextLocator);
    }
    const fingerprintPresented = await this.customWaitIsPresented(this.tokenFingerprintTextLocator, oneSecond, quarterSecond);
    let fingerprint = null;
    if (fingerprintPresented) {
      fingerprint = await this.getText(this.tokenFingerprintTextLocator);
    }
    const cardanoscanLink = await this.getAttribute(this.tokenDetailsLinkLocator, 'href');

    return { name, description, websiteLink, policyId, fingerprint, cardanoscanLink };
  }
  async copyPolicyId() {
    this.logger.info(`PortfolioTokenDetails::copyPolicyId is called`);
    await this.click(this.tokenFingerprintCopyBtn);
  }
  async copyFingerprint() {
    this.logger.info(`PortfolioTokenDetails::copyFingerprint is called`);
    await this.click(this.tokenFingerprintCopyBtn);
  }
}
