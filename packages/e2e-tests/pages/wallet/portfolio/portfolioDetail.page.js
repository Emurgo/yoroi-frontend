import WalletCommonBase from '../../walletCommonBase.page.js';
import { ElementLocator } from '../../locator.js';

export default class PortfolioDetailPage extends WalletCommonBase {
  // Portfolio Details Page Locators

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
  portfolioBackButtonLocator = {
    locator: 'portfolio:tokenDetails-backButton-back-button',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioSendButtonLocator = {
    locator: 'portfolio:tokenDetails-sendButton',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioReceiveButtonLocator = {
    locator: 'portfolio:tokenDetails-receiveButton',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioSwapButtonLocator = {
    locator: 'portfolio:tokenDetails-swapButton',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioChartContainerLocator = {
    locator: '.recharts-responsive-container',
    method: 'css',
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
   * Checks if the price chart is rendered inside the details container
   * @returns {Promise<boolean>}
   */
  async isPriceChartDisplayed() {
    this.logger.info(`PortfolioDetailPage::isPriceChartDisplayed is called`);
    try {
      await this.customWaitIsPresented(this.portfolioChartContainerLocator);
      return true;
    } catch (_e) {
      this.logger.warn(`PortfolioDetailPage::isPriceChartDisplayed - Chart not found: ${_e.message}`);
      return false;
    }
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
