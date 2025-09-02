import WalletCommonBase from '../../walletCommonBase.page.js';
import { pageTitle } from '../../../helpers/pageTitles.js';
import { ElementLocator } from '../../locator.js';

export default class PortfolioDetailPage extends WalletCommonBase {
  // ADA Details Page Locators

  /** @type {ElementLocator} */
  portfolioTokenDetailsLocator = {
    locator: 'portfolio:tokenDetails-tokenDetailsPage-container',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTokenHeaderSectionLocator = {
    locator: 'portfolio:tokenDetails-tokenDetailsHeader-header',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTokenBalanceLabelLocator = {
    locator: 'portfolio-token-balance-label',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTokenBalanceAmountLocator = {
    locator: '//*[@id="portfolio:tokenDetails-tokenDetailsHeader-header"]/button/p',
    method: 'xpath',
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

  /** @type {ElementLocator} */
  portfolioBackButtonLocator = {
    locator: '//*[@id="portfolio:tokenDetails-tokenDetailsHeader-header"]/button/p',
    method: 'xpath',
  };

  /** @type {ElementLocator} */
  portfolioSendButtonLocator = {
    locator: 'portfolio:tokenDetails-sendButton-sendButton',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioReceiveButtonLocator = {
    locator: 'portfolio:tokenDetails-receiveButton-receiveButton',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioSwapButtonLocator = {
    locator: 'portfolio:tokenDetails-swapButton-swapButton',
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

  /**
   * Clicks the back button to return to portfolio
   * @returns {Promise<void>}
   */
  async clickBackButton() {
    this.logger.info(`PortfolioDetailPage::clickBackButton is called`);
    await this.click(this.portfolioBackButtonLocator);
  }

  /**
   * Clicks the Send button
   * @returns {Promise<void>}
   */
  async clickSendButton() {
    this.logger.info(`PortfolioDetailPage::clickSendButton is called`);
    await this.click(this.portfolioSendButtonLocator);
  }

  /**
   * Clicks the Receive button
   * @returns {Promise<void>}
   */
  async clickReceiveButton() {
    this.logger.info(`PortfolioDetailPage::clickReceiveButton is called`);
    await this.click(this.portfolioReceiveButtonLocator);
  }

  /**
   * Clicks the Swap button
   * @returns {Promise<void>}
   */
  async clickSwapButton() {
    this.logger.info(`PortfolioDetailPage::clickSwapButton is called`);
    await this.click(this.portfolioSwapButtonLocator);
  }

  /**
   * Checks if Swap button is available
   * @returns {Promise<boolean>}
   */
  async isSwapButtonAvailable() {
    this.logger.info(`PortfolioDetailPage::isSwapButtonAvailable is called`);
    return await this.customWaitIsPresented(this.portfolioSwapButtonLocator);
  }
}
