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
  }
  /** @type {ElementLocator} */
  switchBalanceBtnLocator = {
    locator: 'portfolio:header-switchCurrencies-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  serchInputLocator = {
    locator: 'portfolio:header-search-input',
    method: 'id'
  }
  // tokensTable
  // nameColumnHeader
  // priceColumnHeader
  // dayColumnHeader
  // weekColumnHeader
  // monthColumnHeader
  // percentageColumnHeader
  // totalColumnHeader
  // getTokenLocatorByIndex
  // getTokenLocatorByName

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
