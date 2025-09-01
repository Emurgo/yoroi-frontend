import WalletCommonBase from '../../walletCommonBase.page.js';
import { pageTitle } from '../../../helpers/pageTitles.js';
import { ElementLocator } from '../../locator.js';

export default class PortfolioMainPage extends WalletCommonBase {
  // locators

  /** @type {ElementLocator} */
  portfolioBalanceLocator = {
    locator: 'portfolio-balance-text',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioSearchInputLocator = {
    locator: 'portfolio-search-input',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTableLocator = {
    locator: 'portfolio-stat-table',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTableBodyLocator = {
    locator: 'portfolio-stat-table-body',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTableHeadLocator = {
    locator: 'portfolio-table-head',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioAssetItemLocator = {
    locator: '[data-testid^="portfolio-table-row-"]',
    method: 'css',
  };

  /** @type {ElementLocator} */
  portfolioAssetsListLocator = {
    locator: 'portfolio-stat-table-body',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioPriceColumnLocator = {
    locator: '[data-testid*="portfolio-table-cell-price-"]',
    method: 'css',
  };

  /** @type {ElementLocator} */
  portfolio24HChangeColumnLocator = {
    locator: '[data-testid*="portfolio-table-cell-24h-"]',
    method: 'css',
  };

  /** @type {ElementLocator} */
  portfolio1WChangeColumnLocator = {
    locator: '[data-testid*="portfolio-table-cell-1w-"]',
    method: 'css',
  };

  /** @type {ElementLocator} */
  portfolio1MChangeColumnLocator = {
    locator: '[data-testid*="portfolio-table-cell-1m-"]',
    method: 'css',
  };

  /** @type {ElementLocator} */
  portfolioPercentageColumnLocator = {
    locator: '[data-testid*="portfolio-table-cell-portfolio-"]',
    method: 'css',
  };

  /** @type {ElementLocator} */
  portfolioTotalAmountColumnLocator = {
    locator: '[data-testid*="portfolio-table-cell-total-"]',
    method: 'css',
  };

  /**
   * Get locator for a specific asset by index
   * @param {number} assetIndex
   * @returns {ElementLocator}
   */
  getAssetItemLocator(assetIndex) {
    return {
      locator: `[data-testid^="portfolio-table-row-"]:nth-child(${assetIndex + 1})`,
      method: 'css',
    };
  }

  /**
   * Get locator for a specific asset by name
   * @param {string} assetName
   * @returns {ElementLocator}
   */
  getAssetByNameLocator(assetName) {
    return {
      locator: `portfolio-table-row-${assetName}`,
      method: 'id',
    };
  }

  /**
   * Get locator for table header by visible label
   * @param {string} label
   * @returns {ElementLocator}
   */
  getHeaderByLabelLocator(label) {
    const headerIdMap = {
      'Name': 'name',
      'Price': 'price',
      '24H': '24h',
      '1W': '1W',
      '1M': '1M',
      'Portfolio %': 'portfolioPercents',
      'Total amount': 'totalAmount'
    };
    const headerId = headerIdMap[label];
    return {
      locator: `portfolio-table-header-${headerId}`,
      method: 'id',
    };
  }

  /**
   * Get locator for a specific cell in an asset row by name and column type
   * @param {string} assetName
   * @param {string} columnType - 'name', 'price', '24h', '1w', '1m', 'portfolio', 'total'
   * @returns {ElementLocator}
   */
  getAssetRowCellByTypeLocator(assetName, columnType) {
    return {
      locator: `portfolio-table-cell-${columnType}-${assetName}`,
      method: 'id',
    };
  }

  /**
   * Get locator for a specific cell in an asset row by name and 1-based column index (legacy method)
   * @param {string} assetName
   * @param {number} columnIndex
   * @returns {ElementLocator}
   */
  getAssetRowCellByIndexLocator(assetName, columnIndex) {
    const columnTypeMap = {
      1: 'name',
      2: 'price',
      3: '24h',
      4: '1w',
      5: '1m',
      6: 'portfolio',
      7: 'total'
    };
    const columnType = columnTypeMap[columnIndex];
    return this.getAssetRowCellByTypeLocator(assetName, columnType);
  }

  /**
   * Checks if the portfolio page is displayed
   * @returns {Promise<boolean>}
   */
  async isDisplayed() {
    this.logger.info(`PortfolioMainPage::isDisplayed is called`);
    const titleIsCorrectPromise = this.titleIsCorrect(pageTitle.portfolio);
    const balanceIsDisplayedPromise = this.customWaitIsPresented(this.portfolioBalanceLocator);
    const searchIsDisplayedPromise = this.customWaitIsPresented(this.portfolioSearchInputLocator);
    const [titleState, balanceState, searchState] = await Promise.all([
      titleIsCorrectPromise,
      balanceIsDisplayedPromise,
      searchIsDisplayedPromise,
    ]);
    return titleState && balanceState && searchState;
  }

  /**
   * Gets the portfolio balance as text
   * @returns {Promise<string>}
   */
  async getPortfolioBalance() {
    return await this.getText(this.portfolioBalanceLocator);
  }

  /**
   * Counts the number of assets displayed in the portfolio
   * @returns {Promise<number>}
   */
  async countAssets() {
    const elems = await this.findElements(this.portfolioAssetItemLocator);
    return elems.length;
  }

  /**
   * Clicks on a specific asset by index
   * @param {number} assetIndex
   * @returns {Promise<void>}
   */
  async clickAssetByIndex(assetIndex) {
    const locator = this.getAssetItemLocator(assetIndex);
    await this.click(locator);
  }

  /**
   * Clicks on a specific asset by name
   * @param {string} assetName
   * @returns {Promise<void>}
   */
  async clickAssetByName(assetName) {
    const locator = this.getAssetByNameLocator(assetName);
    await this.click(locator);
  }

  /**
   * Checks if an asset row with a given name is displayed
   * @param {string} assetName
   * @returns {Promise<boolean>}
   */
  async isAssetDisplayed(assetName) {
    const locator = this.getAssetByNameLocator(assetName);
    return await this.customWaitIsPresented(locator);
  }

  /**
   * Checks if table header labels are displayed
   * @param {string[]} labels
   * @returns {Promise<boolean>}
   */
  async areHeaderLabelsDisplayed(labels) {
    for (const label of labels) {
      const locator = this.getHeaderByLabelLocator(label);
      const displayed = await this.customWaitIsPresented(locator);
      if (!displayed) return false;
    }
    return true;
  }

  /**
   * Checks that key cells for an asset row are present (Name, Price, 24H, 1W, 1M, Portfolio %, Total amount)
   * @param {string} assetName
   * @returns {Promise<boolean>}
   */
  async areAssetKeyCellsDisplayed(assetName) {
    // Column types: name, price, 24h, 1w, 1m, portfolio, total
    const requiredColumnTypes = ['name', 'price', '24h', '1w', '1m', 'portfolio', 'total'];
    for (const columnType of requiredColumnTypes) {
      const locator = this.getAssetRowCellByTypeLocator(assetName, columnType);
      const displayed = await this.customWaitIsPresented(locator);
      if (!displayed) return false;
    }
    return true;
  }

  /**
   * Searches for an asset in the portfolio search input
   * @param {string} searchTerm
   * @returns {Promise<void>}
   */
  async searchForAsset(searchTerm) {
    this.logger.info(`PortfolioMainPage::searchForAsset is called with term: "${searchTerm}"`);
    await this.clearInput(this.portfolioSearchInputLocator);
    await this.input(this.portfolioSearchInputLocator, searchTerm);
  }

  /**
   * Clears the search input
   * @returns {Promise<void>}
   */
  async clearSearch() {
    this.logger.info(`PortfolioMainPage::clearSearch is called`);
    await this.clearInput(this.portfolioSearchInputLocator);
  }

  /**
   * Verifies that price values are displayed (not empty or just dashes)
   * @returns {Promise<boolean>}
   */
  async arePriceValuesDisplayed() {
    this.logger.info(`PortfolioMainPage::arePriceValuesDisplayed is called`);

    const priceElements = await this.findElements(this.portfolioPriceColumnLocator);

    for (const element of priceElements) {
      const text = await element.getText();
      // Check if price is not empty and not just a dash
      if (!text || text.trim() === '-' || text.trim() === '') {
        this.logger.info(`Price value is empty or dash: "${text}"`);
        return false;
      }
      // Check if it contains USD (indicating a valid price)
      if (!text.includes('USD')) {
        this.logger.info(`Price value doesn't contain USD: "${text}"`);
        return false;
      }
    }

    return true;
  }

  /**
   * Verifies that 24H change values are displayed (not empty or just dashes)
   * @returns {Promise<boolean>}
   */
  async are24HChangeValuesDisplayed() {
    this.logger.info(`PortfolioMainPage::are24HChangeValuesDisplayed is called`);

    const changeElements = await this.findElements(this.portfolio24HChangeColumnLocator);

    for (const element of changeElements) {
      const text = await element.getText();
      // Check if 24H change is not empty and not just a dash
      if (!text || text.trim() === '-' || text.trim() === '') {
        this.logger.info(`24H change value is empty or dash: "${text}"`);
        return false;
      }
      // Check if it contains % (indicating a valid percentage)
      if (!text.includes('%')) {
        this.logger.info(`24H change value doesn't contain %: "${text}"`);
        return false;
      }
    }

    return true;
  }

  /**
   * Verifies that portfolio percentage values are displayed (not empty or just dashes)
   * @returns {Promise<boolean>}
   */
  async arePortfolioPercentageValuesDisplayed() {
    this.logger.info(`PortfolioMainPage::arePortfolioPercentageValuesDisplayed is called`);

    const portfolioElements = await this.findElements(this.portfolioPercentageColumnLocator);

    for (const element of portfolioElements) {
      const text = await element.getText();
      // Check if portfolio % is not empty and not just a dash
      if (!text || text.trim() === '-' || text.trim() === '') {
        this.logger.info(`Portfolio % value is empty or dash: "${text}"`);
        return false;
      }
      // Check if it contains % (indicating a valid percentage)
      if (!text.includes('%')) {
        this.logger.info(`Portfolio % value doesn't contain %: "${text}"`);
        return false;
      }
    }

    return true;
  }

  /**
   * Verifies that total amount values are displayed (not empty or just dashes)
   * @returns {Promise<boolean>}
   */
  async areTotalAmountValuesDisplayed() {
    this.logger.info(`PortfolioMainPage::areTotalAmountValuesDisplayed is called`);

    const amountElements = await this.findElements(this.portfolioTotalAmountColumnLocator);

    for (const element of amountElements) {
      const text = await element.getText();
      // Check if total amount is not empty and not just a dash
      if (!text || text.trim() === '-' || text.trim() === '') {
        this.logger.info(`Total amount value is empty or dash: "${text}"`);
        return false;
      }
      // Check if it contains a number (indicating a valid amount)
      if (!/\d/.test(text)) {
        this.logger.info(`Total amount value doesn't contain numbers: "${text}"`);
        return false;
      }
    }

    return true;
  }

  /**
   * Verifies that all value columns have valid data loaded
   * @returns {Promise<boolean>}
   */
  async areAllValuesLoaded() {
    this.logger.info(`PortfolioMainPage::areAllValuesLoaded is called`);

    const priceValuesOk = await this.arePriceValuesDisplayed();
    const change24HValuesOk = await this.are24HChangeValuesDisplayed();
    const portfolioValuesOk = await this.arePortfolioPercentageValuesDisplayed();
    const amountValuesOk = await this.areTotalAmountValuesDisplayed();

    return priceValuesOk && change24HValuesOk && portfolioValuesOk && amountValuesOk;
  }
}
