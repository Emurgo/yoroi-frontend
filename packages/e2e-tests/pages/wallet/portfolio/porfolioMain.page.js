import WalletCommonBase from '../../walletCommonBase.page.js';
import { ElementLocator } from '../../locator.js';

export default class Portfolio extends WalletCommonBase {
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
    locator: '$portfolio:header-secondCurrency-text',
    id: 'id',
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
  getColumnBtnLocator = columnIdentificator => {
    return {
      locator: `portfolio:table:header-${columnIdentificator}Column-button`,
      method: 'id',
    };
  };
  getDescColumnIconLocator = columnIdentificator => {
    return {
      locator: `portfolio:table:header:${columnIdentificator}Column-descIcon-component`,
      method: 'id',
    };
  };
  getAscColumnIconLocator = columnIdentificator => {
    return {
      locator: `portfolio:table:header:${columnIdentificator}Column-ascIcon-component`,
      method: 'id',
    };
  };
  // getTokenLocatorByIndex
  // getTokenLocatorByName
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
  // isDisplayed
  // search
  // clearSearch
  // clickTokenByIndex
  // clickTokenByName
  // sortBy, pass column name
  // getTokenInfoByIndex
  // getTokenInfoByName
}
