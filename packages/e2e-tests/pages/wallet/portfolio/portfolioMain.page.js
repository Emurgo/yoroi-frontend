import WalletCommonBase from '../../walletCommonBase.page.js';
import { pageTitle } from '../../../helpers/pageTitles.js';
import { ElementLocator } from '../../locator.js';

export default class PortfolioMainPage extends WalletCommonBase {
  // locators

  /** @type {ElementLocator} */
  portfolioBalanceLocator = {
    locator: '//h2[contains(@class, "MuiTypography-h2")]',
    method: 'xpath',
  };

  /** @type {ElementLocator} */
  portfolioSearchInputLocator = {
    locator: '//input[@placeholder="Search by asset name or ID"]',
    method: 'xpath',
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
}
