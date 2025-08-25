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
  portfolioAssetItemLocator = {
    locator: '//table[@aria-label="stat table"]//tbody//tr',
    method: 'xpath',
  };

  /** @type {ElementLocator} */
  portfolioAssetsListLocator = {
    locator: '//table[@aria-label="stat table"]//tbody',
    method: 'xpath',
  };

  /**
   * Get locator for a specific asset by index
   * @param {number} assetIndex
   * @returns {ElementLocator}
   */
  getAssetItemLocator(assetIndex) {
    return {
      locator: `(//table[@aria-label="stat table"]//tbody//tr)[${assetIndex + 1}]`,
      method: 'xpath',
    };
  }

  /**
   * Get locator for a specific asset by name
   * @param {string} assetName
   * @returns {ElementLocator}
   */
  getAssetByNameLocator(assetName) {
    return {
      locator: `//table[@aria-label="stat table"]//tr[.//p[normalize-space()='${assetName}']]`,
      method: 'xpath',
    };
  }

  /**
   * Get locator for table header by visible label
   * @param {string} label
   * @returns {ElementLocator}
   */
  getHeaderByLabelLocator(label) {
    return {
      locator: `//table[@aria-label='stat table']//thead//th//p[normalize-space()='${label}']`,
      method: 'xpath',
    };
  }

  /**
   * Get locator for a specific cell in an asset row by name and 1-based column index
   * @param {string} assetName
   * @param {number} columnIndex
   * @returns {ElementLocator}
   */
  getAssetRowCellByIndexLocator(assetName, columnIndex) {
    return {
      locator: `//table[@aria-label="stat table"]//tr[.//p[normalize-space()='${assetName}']]/td[${columnIndex}]`,
      method: 'xpath',
    };
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
    return this.getText(this.portfolioBalanceLocator);
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
    return this.customWaitIsPresented(locator);
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
   * Column indexes are 1-based in DOM order
   * @param {string} assetName
   * @returns {Promise<boolean>}
   */
  async areAssetKeyCellsDisplayed(assetName) {
    // Columns: 1 Name, 2 Price, 3 24H, 4 1W, 5 1M, 6 Portfolio %, 7 Total amount
    const requiredColumns = [1, 2, 3, 4, 5, 6, 7];
    for (const col of requiredColumns) {
      const locator = this.getAssetRowCellByIndexLocator(assetName, col);
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
    
    // Get all price cells (column 2)
    const priceLocator = {
      locator: '//tbody/tr/td[2]',
      method: 'xpath',
    };
    
    const priceElements = await this.findElements(priceLocator);
    
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
    
    // Get all 24H change cells (column 3)
    const change24HLocator = {
      locator: '//tbody/tr/td[3]',
      method: 'xpath',
    };
    
    const changeElements = await this.findElements(change24HLocator);
    
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
    
    // Get all portfolio % cells (column 6)
    const portfolioLocator = {
      locator: '//tbody/tr/td[6]',
      method: 'xpath',
    };
    
    const portfolioElements = await this.findElements(portfolioLocator);
    
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
    
    // Get all total amount cells (column 7)
    const amountLocator = {
      locator: '//tbody/tr/td[7]',
      method: 'xpath',
    };
    
    const amountElements = await this.findElements(amountLocator);
    
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
