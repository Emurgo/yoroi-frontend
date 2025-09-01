import WalletCommonBase from '../../walletCommonBase.page.js';
import { pageTitle } from '../../../helpers/pageTitles.js';
import { ElementLocator } from '../../locator.js';

export default class PortfolioDetailPage extends WalletCommonBase {
  // ADA Details Page Locators

  /** @type {ElementLocator} */
  portfolioTokenDetailsLocator = {
    locator: 'portfolio-token-details',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTokenHeaderSectionLocator = {
    locator: 'portfolio-token-header-section',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTokenBalanceLabelLocator = {
    locator: 'portfolio-token-balance-label',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTokenBalanceAmountLocator = {
    locator: 'portfolio-token-balance-amount',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTokenNameLocator = {
    locator: 'portfolio-token-name',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTokenBalanceValueLocator = {
    locator: 'portfolio-token-balance-value',
    method: 'id',
  };



  /**
   * Checks if the portfolio detail page is displayed
   * @returns {Promise<boolean>}
   */
  async isDisplayed() {
    this.logger.info(`PortfolioDetailPage::isDisplayed is called`);
    const tokenDetailsIsDisplayed = await this.customWaitIsPresented(this.portfolioTokenDetailsLocator);
    const headerSectionIsDisplayed = await this.customWaitIsPresented(this.portfolioTokenHeaderSectionLocator);
    return tokenDetailsIsDisplayed && headerSectionIsDisplayed;
  }



  /**
   * Checks if token balance label is displayed on details page
   * @returns {Promise<boolean>}
   */
  async isTokenBalanceLabelDisplayed() {
    this.logger.info(`PortfolioDetailPage::isTokenBalanceLabelDisplayed is called`);
    return await this.customWaitIsPresented(this.portfolioTokenBalanceLabelLocator);
  }

  /**
   * Checks if token balance amount is displayed on details page
   * @returns {Promise<boolean>}
   */
  async isTokenBalanceAmountDisplayed() {
    this.logger.info(`PortfolioDetailPage::isTokenBalanceAmountDisplayed is called`);
    return await this.customWaitIsPresented(this.portfolioTokenBalanceAmountLocator);
  }

  /**
   * Checks if token name is displayed on details page
   * @returns {Promise<boolean>}
   */
  async isTokenNameDisplayed() {
    this.logger.info(`PortfolioDetailPage::isTokenNameDisplayed is called`);
    return await this.customWaitIsPresented(this.portfolioTokenNameLocator);
  }

  /**
   * Checks if token balance value is displayed on details page
   * @returns {Promise<boolean>}
   */
  async isTokenBalanceValueDisplayed() {
    this.logger.info(`PortfolioDetailPage::isTokenBalanceValueDisplayed is called`);
    return await this.customWaitIsPresented(this.portfolioTokenBalanceValueLocator);
  }

  /**
   * Gets the token balance amount as text
   * @returns {Promise<string>}
   */
  async getTokenBalanceAmount() {
    this.logger.info(`PortfolioDetailPage::getTokenBalanceAmount is called`);
    return await this.getText(this.portfolioTokenBalanceAmountLocator);
  }

  /**
   * Gets the token name as text
   * @returns {Promise<string>}
   */
  async getTokenName() {
    this.logger.info(`PortfolioDetailPage::getTokenName is called`);
    return await this.getText(this.portfolioTokenNameLocator);
  }

  /**
   * Gets the token balance value as text
   * @returns {Promise<string>}
   */
  async getTokenBalanceValue() {
    this.logger.info(`PortfolioDetailPage::getTokenBalanceValue is called`);
    return await this.getText(this.portfolioTokenBalanceValueLocator);
  }
}
