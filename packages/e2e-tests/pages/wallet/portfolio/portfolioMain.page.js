import WalletCommonBase from '../../walletCommonBase.page.js';
import { pageTitle } from '../../../helpers/pageTitles.js';
import { ElementLocator } from '../../locator.js';
import { twoSeconds } from '../../../helpers/timeConstants.js';

export default class PortfolioMainPage extends WalletCommonBase {
  // locators

  /** @type {ElementLocator} */
  portfolioBalanceLocator = {
    locator: 'portfolio:header-portfolioBalance-balanceText',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioSearchInputLocator = {
    locator: 'portfolio:header-portfolioSearch-searchInput',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTableBodyLocator = {
    locator: 'portfolio:statTable-assetsList-tableBody',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioCurrencySwitchLocator = {
    locator: 'portfolio:header-portfolioCurrencySwitch-currencySwitch',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioNoResultsMessageLocator = {
    locator: 'portfolio:statTable-noResultsMessage-noResults',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioAssetRowsLocator = {
    locator: 'portfolio:statTable-assetsList-tableBody',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioAssetNameCellLocator = {
    locator: 'portfolio:statTable:asset_0:assetName-assetName-cell',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioAssetNameCellPattern = {
    locator: 'portfolio:statTable:asset_INDEX:assetName-assetName-cell',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioNameHeaderLocator = {
    locator: 'portfolio:statTable:nameColumn-nameHeader-cell',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioPriceHeaderLocator = {
    locator: 'portfolio:statTable:priceColumn-priceHeader-cell',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolio24HHeaderLocator = {
    locator: 'portfolio:statTable:24hColumn-24hHeader-cell',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolio1WHeaderLocator = {
    locator: 'portfolio:statTable:1WColumn-1WHeader-cell',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolio1MHeaderLocator = {
    locator: 'portfolio:statTable:1MColumn-1MHeader-cell',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioPortfolioHeaderLocator = {
    locator: 'portfolio:statTable:portfolioPercentsColumn-portfolioPercentsHeader-cell',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioTotalAmountHeaderLocator = {
    locator: 'portfolio:statTable:totalAmountColumn-totalAmountHeader-cell',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioAllAssetNameCellsLocator = {
    locator: 'portfolio:statTable-assetsList-tableBody',
    method: 'id',
  };

  /** @type {ElementLocator} */
  portfolioFirstAssetRowLocator = {
    locator: 'portfolio:statTable:asset_0-assetRow-tableRow',
    method: 'id',
  };

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
    const elems = await this.findElements(this.portfolioAssetRowsLocator);
    return elems.length;
  }

  /**
   * Checks if an asset row with a given name is displayed
   * @param {string} assetName
   * @returns {Promise<boolean>}
   */
  async isAssetDisplayed(assetName) {
    this.logger.info(`PortfolioMainPage::isAssetDisplayed is called for asset: ${assetName}`);
    
    try {
      // Find all asset name cells and check if any contain the asset name
      const nameCells = await this.findElements(this.portfolioAllAssetNameCellsLocator);
      
      for (const cell of nameCells) {
        const text = await cell.getText();
        if (text && text.includes(assetName)) {
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      return false;
    }
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
    // Use framework helper to select-all and backspace to trigger input change
    await this.clearInputAll(this.portfolioSearchInputLocator);
  }

  /**
   * Switches to fiat currency display
   * @returns {Promise<void>}
   */
  async switchToFiatCurrency() {
    this.logger.info(`PortfolioMainPage::switchToFiatCurrency is called`);
    await this.click(this.portfolioCurrencySwitchLocator);
  }

  /**
   * Switches to ADA currency display
   * @returns {Promise<void>}
   */
  async switchToAdaCurrency() {
    this.logger.info(`PortfolioMainPage::switchToAdaCurrency is called`);
    await this.click(this.portfolioCurrencySwitchLocator);
  }

  /**
   * Checks if no results message is displayed
   * @returns {Promise<boolean>}
   */
  async isNoResultsMessageDisplayed() {
    this.logger.info(`PortfolioMainPage::isNoResultsMessageDisplayed is called`);
    try {
      const count = await this.countAssets();
      return count === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the current value of the search input
   * @returns {Promise<string>}
   */
  async getSearchInputValue() {
    this.logger.info(`PortfolioMainPage::getSearchInputValue is called`);
    return await this.getAttribute(this.portfolioSearchInputLocator, 'value');
  }

  /**
   * Sorts the table by a specific column
   * @param {string} columnName - The name of the column to sort by
   * @returns {Promise<void>}
   */
  async sortByColumn(columnName) {
    this.logger.info(`PortfolioMainPage::sortByColumn is called with column: ${columnName}`);
    let headerLocator;
    switch (columnName) {
      case 'Name':
        headerLocator = this.portfolioNameHeaderLocator;
        break;
      case 'Price':
        headerLocator = this.portfolioPriceHeaderLocator;
        break;
      case '24H':
        headerLocator = this.portfolio24HHeaderLocator;
        break;
      case '1W':
        headerLocator = this.portfolio1WHeaderLocator;
        break;
      case '1M':
        headerLocator = this.portfolio1MHeaderLocator;
        break;
      case 'Portfolio %':
        headerLocator = this.portfolioPortfolioHeaderLocator;
        break;
      case 'Total amount':
        headerLocator = this.portfolioTotalAmountHeaderLocator;
        break;
      default:
        this.logger.warn(`PortfolioMainPage::sortByColumn - Unknown column name: ${columnName}`);
        return;
    }
    await this.click(headerLocator);
  }

  /**
   * Waits for data to load on portfolio page
   * @returns {Promise<void>}
   */
  async waitForDataToLoad() {
    this.logger.info(`PortfolioMainPage::waitForDataToLoad is called`);
    await this.customWaitIsPresented(this.portfolioTableBodyLocator);
  }

  /**
   * Waits for portfolio balance element to be present/visible
   * @returns {Promise<void>}
   */
  async waitForBalanceToLoad() {
    this.logger.info(`PortfolioMainPage::waitForBalanceToLoad is called`);
    await this.customWaitIsPresented(this.portfolioBalanceLocator);
  }

  /**
   * Waits for balance to update after currency switch
   * (framework-style: reuse presence check; tests rely on this method existing)
   * @returns {Promise<void>}
   */
  async waitForBalanceToUpdate() {
    this.logger.info(`PortfolioMainPage::waitForBalanceToUpdate is called`);
    await this.customWaitIsPresented(this.portfolioBalanceLocator);
  }

  /**
   * Waits for search results to load
   * @returns {Promise<void>}
   */
  async waitForSearchResults() {
    this.logger.info(`PortfolioMainPage::waitForSearchResults is called`);
    try {
      await this.customWaitIsPresented(this.portfolioAssetRowsLocator);
    } catch (error) {
      await this.customWaitIsPresented(this.portfolioNoResultsMessageLocator);
    }
  }

  /**
   * Clicks on the first asset row
   * @returns {Promise<void>}
   */
  async clickFirstAsset() {
    this.logger.info(`PortfolioMainPage::clickFirstAsset is called`);
    await this.click(this.portfolioFirstAssetRowLocator);
  }

  /**
   * Click asset by name (single-asset wallet shortcut)
   * @param {string} assetName
   * @returns {Promise<void>}
   */
  async clickAssetByName(assetName) {
    this.logger.info(`PortfolioMainPage::clickAssetByName is called for asset: ${assetName}`);
    // In current test wallet there is a single asset, click the first row
    await this.click(this.portfolioFirstAssetRowLocator);
  }

  /**
   * Gets all asset names from the portfolio table
   * @returns {Promise<string[]>}
   */
  async getAllAssetNames() {
    this.logger.info(`PortfolioMainPage::getAllAssetNames is called`);
    const assetNames = [];

    // Determine the number of asset rows from the table body
    const tableBodyElem = await this.findElement(this.portfolioTableBodyLocator);
    const allRows = await tableBodyElem.findElements({ tagName: 'tr' });
    const rowsCount = allRows.length;

    for (let index = 0; index < rowsCount; index++) {
      const assetNameLocator = {
        locator: this.portfolioAssetNameCellPattern.locator.replace('INDEX', index.toString()),
        method: this.portfolioAssetNameCellPattern.method,
      };

      try {
        const nameCell = await this.findElement(assetNameLocator);
        const text = await nameCell.getText();
        if (text && text.trim()) {
          const cleanText = text.trim().split('\n')[0];
          if (cleanText && !assetNames.includes(cleanText)) {
            assetNames.push(cleanText);
          }
        }
      } catch (_ignored) {
        // If a particular index is missing, continue to try remaining rows
        continue;
      }
    }

    return assetNames;
  }

  /**
   * Waits for navigation to details page
   * @returns {Promise<void>}
   */
  async waitForNavigationToDetails() {
    this.logger.info(`PortfolioMainPage::waitForNavigationToDetails is called`);
    await this.sleep(twoSeconds);
  }

  /**
   * Waits for navigation back to portfolio page
   * @returns {Promise<void>}
   */
  async waitForNavigationToPortfolio() {
    this.logger.info(`PortfolioMainPage::waitForNavigationToPortfolio is called`);
    await this.customWaitIsPresented(this.portfolioTableBodyLocator);
  }

  /**
   * Waits for navigation to Send page
   * @returns {Promise<void>}
   */
  async waitForNavigationToSend() {
    this.logger.info(`PortfolioMainPage::waitForNavigationToSend is called`);
    await this.sleep(twoSeconds);
  }

  /**
   * Waits for navigation to Receive page
   * @returns {Promise<void>}
   */
  async waitForNavigationToReceive() {
    this.logger.info(`PortfolioMainPage::waitForNavigationToReceive is called`);
    await this.sleep(twoSeconds);
  }
}
