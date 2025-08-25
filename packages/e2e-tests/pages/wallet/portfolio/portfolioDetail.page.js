import WalletCommonBase from '../../walletCommonBase.page.js';
import { pageTitle } from '../../../helpers/pageTitles.js';
import { ElementLocator } from '../../locator.js';

export default class PortfolioDetailPage extends WalletCommonBase {
  // ADA Details Page Locators

  /** @type {ElementLocator} */
  adaLogoLocator = {
    locator: '//img[contains(@class, "MuiBox-root")]',
    method: 'xpath',
  };

  /** @type {ElementLocator} */
  adaNameLocator = {
    locator: '//p[contains(text(), "TADA") and contains(@class, "MuiTypography-body1")]',
    method: 'xpath',
  };

  /** @type {ElementLocator} */
  infoSectionLocator = {
    locator: '//p[contains(text(), "Info") and contains(@class, "MuiTypography-body1")]',
    method: 'xpath',
  };

  /** @type {ElementLocator} */
  websiteLinkLocator = {
    locator: '//a[contains(@href, "cardano.org")]',
    method: 'xpath',
  };

  /** @type {ElementLocator} */
  cardanoScanLinkLocator = {
    locator: '//a[contains(text(), "CardanoScan")]',
    method: 'xpath',
  };

  /** @type {ElementLocator} */
  timeSelectorsLocator = {
    locator: '//button[contains(text(), "24 H") and contains(@class, "MuiButton-contained")]',
    method: 'xpath',
  };

  /**
   * Checks if the portfolio detail page is displayed
   * @returns {Promise<boolean>}
   */
  async isDisplayed() {
    this.logger.info(`PortfolioDetailPage::isDisplayed is called`);
    const adaNameIsDisplayed = await this.customWaitIsPresented(this.adaNameLocator);
    const infoSectionIsDisplayed = await this.customWaitIsPresented(this.infoSectionLocator);
    return adaNameIsDisplayed && infoSectionIsDisplayed;
  }

  /**
   * Checks if ADA logo is displayed on details page
   * @returns {Promise<boolean>}
   */
  async isAdaLogoDisplayed() {
    this.logger.info(`PortfolioDetailPage::isAdaLogoDisplayed is called`);
    return this.customWaitIsPresented(this.adaLogoLocator);
  }

  /**
   * Checks if ADA name is displayed on details page
   * @returns {Promise<boolean>}
   */
  async isAdaNameDisplayed() {
    this.logger.info(`PortfolioDetailPage::isAdaNameDisplayed is called`);
    return this.customWaitIsPresented(this.adaNameLocator);
  }

  /**
   * Checks if Info section is displayed on details page
   * @returns {Promise<boolean>}
   */
  async isInfoSectionDisplayed() {
    this.logger.info(`PortfolioDetailPage::isInfoSectionDisplayed is called`);
    return this.customWaitIsPresented(this.infoSectionLocator);
  }

  /**
   * Checks if Website link is displayed on details page
   * @returns {Promise<boolean>}
   */
  async isWebsiteLinkDisplayed() {
    this.logger.info(`PortfolioDetailPage::isWebsiteLinkDisplayed is called`);
    return this.customWaitIsPresented(this.websiteLinkLocator);
  }

  /**
   * Checks if CardanoScan link is displayed on details page
   * @returns {Promise<boolean>}
   */
  async isCardanoScanLinkDisplayed() {
    this.logger.info(`PortfolioDetailPage::isCardanoScanLinkDisplayed is called`);
    return this.customWaitIsPresented(this.cardanoScanLinkLocator);
  }

  /**
   * Checks if time selectors are displayed on details page
   * @returns {Promise<boolean>}
   */
  async areTimeSelectorsDisplayed() {
    this.logger.info(`PortfolioDetailPage::areTimeSelectorsDisplayed is called`);
    return this.customWaitIsPresented(this.timeSelectorsLocator);
  }
}
