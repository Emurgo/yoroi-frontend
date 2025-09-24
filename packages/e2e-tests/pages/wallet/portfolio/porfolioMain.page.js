import WalletCommonBase from '../../walletCommonBase.page.js';
import { ElementLocator } from '../../locator.js';
import { pageTitle } from '../../../helpers/pageTitles.js';
import { strNumberToNumber } from '../../../utils/utils.js';
import { fiveSeconds, halfMinute, halfSecond, quarterSecond, twoSeconds } from '../../../helpers/timeConstants.js';
import { Colors } from '../../../helpers/constants.js';
import { Columns } from '../../../helpers/portfolioHelper.js';

export default class PortfolioTab extends WalletCommonBase {
  // locators
  /** @type {ElementLocator} */
  mainCurrencyValueTextLocator = {
    locator: 'portfolio:header-mainCurrencyValue-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  mainCurrencyFiatTextLocator = {
    locator: 'portfolio:header-mainCurrencyFiat-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  secondCurrencyTextLocator = {
    locator: 'portfolio:header-secondCurrency-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  balancePercentagePerformanceTextLocator = {
    locator: 'portfolio:header:performance-percentage-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  balancePricePerformanceTextLocator = {
    locator: 'portfolio:header:performance-price-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  switchBalanceBtnLocator = {
    locator: 'portfolio:header-switchCurrencies-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  searchInputLocator = {
    locator: 'portfolio:header-search-input',
    method: 'id',
  };
  /**
   * Getting a column locator
   * @param {string} columnIdentificator
   * @returns {ElementLocator}
   */
  getColumnHeaderBtnLocator = columnIdentificator => {
    return {
      locator: `portfolio:table:header-${columnIdentificator}Column-button`,
      method: 'id',
    };
  };
  /**
   * Getting a desc icon column locator
   * @param {string} columnIdentificator
   * @returns {ElementLocator}
   */
  getDescColumnIconLocator = columnIdentificator => {
    return {
      locator: `portfolio:table:header:${columnIdentificator}Column-descIcon-component`,
      method: 'id',
    };
  };
  /**
   * Getting a asc icon column locator
   * @param {string} columnIdentificator
   * @returns {ElementLocator}
   */
  getAscColumnIconLocator = columnIdentificator => {
    return {
      locator: `portfolio:table:header:${columnIdentificator}Column-ascIcon-component`,
      method: 'id',
    };
  };
  /** @type {ElementLocator} */
  allTokensRowLocator = {
    locator: '//tr[starts-with(@id, "portfolio:table-token_") and contains(@id, "-rowComponent")]',
    method: 'xpath',
  };
  /**
   * Getting token row locator by its row index
   * @param {number} rowIndex
   * @returns {ElementLocator}
   */
  getTokenRowLocator = rowIndex => {
    return {
      locator: `portfolio:table-token_${rowIndex}-rowComponent`,
      method: 'id',
    };
  };
  /**
   * Getting token name by its row index
   * @param {number} rowIndex
   * @returns {ElementLocator}
   */
  getTokenNameLocator = rowIndex => {
    return { locator: `portfolio:table:token_${rowIndex}-name-text`, method: 'id' };
  };
  /**
   * Getting token price by its row index
   * @param {number} rowIndex
   * @returns {ElementLocator}
   */
  getTokenPriceLocator = rowIndex => {
    return { locator: `portfolio:table:token_${rowIndex}-price-text`, method: 'id' };
  };
  /**
   * Getting token day price change by its row index
   * @param {number} rowIndex
   * @returns {ElementLocator}
   */
  getTokenDayChangesLocator = rowIndex => {
    return { locator: `portfolio:table:token_${rowIndex}-24h_priceChanges-text`, method: 'id' };
  };
  /**
   * Getting token week price change by its row index
   * @param {number} rowIndex
   * @returns {ElementLocator}
   */
  getTokenWeekChangesLocator = rowIndex => {
    return { locator: `portfolio:table:token_${rowIndex}-1W_priceChanges-text`, method: 'id' };
  };
  /**
   * Getting token month price change by its row index
   * @param {number} rowIndex
   * @returns {ElementLocator}
   */
  getTokenMonthChangesLocator = rowIndex => {
    return { locator: `portfolio:table:token_${rowIndex}-1M_priceChanges-text`, method: 'id' };
  };
  /**
   * Getting token percentage in wallet by its row index
   * @param {number} rowIndex
   * @returns {ElementLocator}
   */
  getTokenPercentageLocator = rowIndex => {
    return { locator: `portfolio:table:token_${rowIndex}-percentage-text`, method: 'id' };
  };
  /**
   * Getting token total in main value and fiat in wallet by its row index
   * @param {number} rowIndex
   * @returns {ElementLocator}
   */
  getTokenTotalMainLocator = rowIndex => {
    return { locator: `portfolio:table:token_${rowIndex}-totalMain-text`, method: 'id' };
  };
  /**
   * Getting the token value in the total column by row index
   * @param {number} rowIndex
   * @returns {ElementLocator}
   */
  getTokenTotalMainCurrencyValueLocator = rowIndex => {
    return { locator: `portfolio:table:token_${rowIndex}-totalMainCurrencyValue-text`, method: 'id' };
  };
  /**
   * Getting the token fiat in the total column by row index
   * @param {number} rowIndex
   * @returns {ElementLocator}
   */
  getTokenTotalMainCurrencyFiatLocator = rowIndex => {
    return { locator: `portfolio:table:token_${rowIndex}-totalMainCurrencyFiat-text`, method: 'id' };
  };
  /**
   * Getting the token secondary value in the column total by row index
   * @param {number} rowIndex
   * @returns {ElementLocator}
   */
  getTokenTotalSecondLocator = rowIndex => {
    return { locator: `portfolio:table:token_${rowIndex}-totalSecond-text`, method: 'id' };
  };
  /** @type {ElementLocator} */
  noResultImageBoxLocator = {
    locator: 'portfolio-noResultsImage-box',
    method: 'id',
  };
  /** @type {ElementLocator} */
  noResultsTextLocator = {
    locator: 'portfolio-noResults-text',
    method: 'id',
  };

  // methods
  async isDisplayed() {
    this.logger.info(`PortfolioTab::isDisplayed is called`);
    const titleIsCorrectPromise = this.titleIsCorrect(pageTitle.portfolio);
    const searchStatePromise = this.customWaitIsPresented(this.searchInputLocator, fiveSeconds, quarterSecond);
    const mainFiatStatePromise = this.customWaitIsPresented(this.mainCurrencyValueTextLocator, fiveSeconds, quarterSecond);
    const [titleState, searchState, mainFiatState] = await Promise.all([
      titleIsCorrectPromise,
      searchStatePromise,
      mainFiatStatePromise,
    ]);
    this.logger.info(`PortfolioTab::isDisplayed titleState -> ${titleState}`);
    this.logger.info(`PortfolioTab::isDisplayed search input state -> ${searchState}`);
    this.logger.info(`PortfolioTab::isDisplayed main fiat state -> ${mainFiatState}`);

    return titleState && searchState && mainFiatState;
  }
  async waitIsLoaded() {
    this.logger.info(`PortfolioTab::waitIsLoaded is called`);
    return await this.customWaitIsPresented(this.getTokenRowLocator(0), halfMinute, halfSecond);
  }
  /**
   * Searching for a token
   * @param {string} searchValue
   * @returns {Promise<void>}
   */
  async search(searchValue) {
    this.logger.info(`PortfolioTab::search is called. Search value: "${searchValue}"`);
    await this.click(this.searchInputLocator);
    await this.input(this.searchInputLocator, searchValue);
  }
  /**
   * Getting amount of token in the tokens table
   * @returns {number} Amount of tokens in the table
   */
  async countTokens() {
    this.logger.info(`PortfolioTab::countTokens is called.`);
    const allTokens = await this.findElements(this.allTokensRowLocator);
    return allTokens.length;
  }
  /**
   * Selecting a token
   * @param {number} rowIndex
   */
  async selectTokenByIndex(rowIndex) {
    this.logger.info(`PortfolioTab::selectTokenByIndex is called. Row index: "${rowIndex}"`);
    const tokenRowLocator = this.getTokenRowLocator(rowIndex);
    await this.click(tokenRowLocator);
  }
  /**
   * Sorting a selected column
   * @param {string} columnName
   */
  async sortBy(columnName) {
    this.logger.info(`PortfolioTab::sortBy is called. Column name: "${columnName}"`);
    const columnHeaderLocator = this.getColumnHeaderBtnLocator(columnName);
    await this.click(columnHeaderLocator);
  }
  async _defineSign(priceChangeLocator) {
    const color = await this.getCssValue(priceChangeLocator, 'color');
    return color === Colors.portfolioNegative ? '-' : '';
  }
  async _getChangeValue(priceLocator) {
    const priceChangeText = await this.getText(priceLocator);
    if (priceChangeText === '-') {
      return null;
    }
    const priceChangeSign = await this._defineSign(priceLocator);
    return strNumberToNumber(`${priceChangeSign}${priceChangeText}`);
  }
  _getNumberOrNull(numberInStr) {
    return numberInStr === '-' ? null : strNumberToNumber(numberInStr);
  }

  /**
   * Getting token info from the table
   * @param {number} rowIndex
   * @returns
   */
  async getTokenInfoByIndex(rowIndex) {
    // Possible place for improvement
    this.logger.info(`PortfolioTab::getTokenInfoByIndex is called. Row index: "${rowIndex}"`);
    const name = await this.getText(this.getTokenNameLocator(rowIndex));

    const priceText = await this.getText(this.getTokenPriceLocator(rowIndex));
    const [priceValue, priceFiat] = priceText.split(' ');
    const price = this._getNumberOrNull(priceValue);

    const priceChangeDay = await this._getChangeValue(this.getTokenDayChangesLocator(rowIndex));
    const priceChangeWeek = await this._getChangeValue(this.getTokenWeekChangesLocator(rowIndex));
    const priceChangeMonth = await this._getChangeValue(this.getTokenWeekChangesLocator(rowIndex));

    const percentageText = await this.getText(this.getTokenPercentageLocator(rowIndex));
    const percentage = strNumberToNumber(percentageText);

    const mainTotalValueText = await this.getText(this.getTokenTotalMainCurrencyValueLocator(rowIndex));
    const mainTotalValue = strNumberToNumber(mainTotalValueText);

    const mainTotalFiat = await this.getText(this.getTokenTotalMainCurrencyFiatLocator(rowIndex));

    let secondTotalValue = null;
    let secondTotalFiat = null;

    const secondaryValuePresented = await this.customWaitIsPresented(
      this.getTokenTotalSecondLocator(rowIndex),
      twoSeconds,
      quarterSecond
    );
    if (secondaryValuePresented) {
      const secondTotalText = await this.getText(this.getTokenTotalSecondLocator(rowIndex));
      [secondTotalValue, secondTotalFiat] = secondTotalText.split(' ');
      secondTotalValue = strNumberToNumber(secondTotalValue);
    }

    return {
      name,
      price,
      priceFiat,
      priceChangeDay,
      priceChangeWeek,
      priceChangeMonth,
      percentage,
      mainTotalValue,
      mainTotalFiat,
      secondTotalValue,
      secondTotalFiat,
    };
  }

  /**
   * Collect values from the pointed column
   * @param {string} columnName - The column name
   * @returns {Promise<Array>} The array of values
   */
  async getColumnValues(columnName) {
    this.logger.info(`PortfolioTab::getColumnValues is called. Column name: "${columnName}"`);

    const columnValues = [];
    const tokenCount = await this.countTokens();

    for (let rowIndex = 0; rowIndex < tokenCount; rowIndex++) {
      try {
        let value = null;

        switch (columnName) {
          case Columns.Name:
            value = await this.getText(this.getTokenNameLocator(rowIndex));
            break;

          case Columns.Price:
            const priceText = await this.getText(this.getTokenPriceLocator(rowIndex));
            const [priceValueText, priceFiat] = priceText.split(/\s/g);
            value = {
              value: this._getNumberOrNull(priceValueText),
              fiat: priceFiat,
            };
            break;

          case Columns.Day:
            value = await this._getChangeValue(this.getTokenDayChangesLocator(rowIndex));
            break;

          case Columns.Week:
            value = await this._getChangeValue(this.getTokenWeekChangesLocator(rowIndex));
            break;

          case Columns.Month:
            value = await this._getChangeValue(this.getTokenMonthChangesLocator(rowIndex));
            break;

          case Columns.Percentage:
            const percentageText = await this.getText(this.getTokenPercentageLocator(rowIndex));
            value = strNumberToNumber(percentageText);
            break;

          case Columns.Total:
            const [tokenAmountText, tokenName, secondBalance] = await Promise.all([
              this.getText(this.getTokenTotalMainCurrencyValueLocator(rowIndex)),
              this.getText(this.getTokenTotalMainCurrencyFiatLocator(rowIndex)),
              this.getText(this.getTokenTotalSecondLocator(rowIndex)),
            ]);
            const tokenAmount = this._getNumberOrNull(tokenAmountText);
            const [currencyBalanceText, currencyFiat] = secondBalance.split(/\s/g);
            const currencyBalance = this._getNumberOrNull(currencyBalanceText);
            value = {
              token: {
                balance: tokenAmount,
                name: tokenName,
              },
              currency: {
                balance: currencyBalance,
                fiat: currencyFiat,
              },
            };
            break;

          default:
            this.logger.warn(`PortfolioTab::getColumnValues: Unknown column name: "${columnName}"`);
            return [];
        }

        columnValues.push(value);
      } catch (error) {
        this.logger.error(`PortfolioTab::getColumnValues: Error getting value for row ${rowIndex}: ${error.message}`);
        columnValues.push(null);
      }
    }

    this.logger.info(`PortfolioTab::getColumnValues: Collected ${columnValues.length} values`);
    return columnValues;
  }

  async getPortfolioBalance() {
    this.logger.info(`PortfolioTab::getPortfolioBalance is called`);
    const [mainValueText, mainBalanceFiat, secondBalance] = await Promise.all([
      this.getText(this.mainCurrencyValueTextLocator),
      this.getText(this.mainCurrencyFiatTextLocator),
      this.getText(this.secondCurrencyTextLocator),
    ]);
    const mainValue = strNumberToNumber(mainValueText);
    const [secondValueText, secondFiat] = secondBalance.split(/\s/g);
    const secondValue = strNumberToNumber(secondValueText);

    return {
      main: {
        value: mainValue,
        fiat: mainBalanceFiat,
      },
      secondary: {
        value: secondValue,
        fiat: secondFiat,
      },
    };
  }

  async switchCurrencies() {
    this.logger.info(`PortfolioTab::switchCurrencies is called`);
    await this.click(this.switchBalanceBtnLocator);
  }
}
