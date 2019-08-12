// @flow

export type CoinPriceCurrencySettingType = {|
  enabled: boolean,
  currency: ?string,
|};

export type Ticker = {|
  from: string, // source currency symbol
  to: string,   // target currency symbol
  price: number,
|};

export const coinPriceCurrencyDisabledValue: CoinPriceCurrencySettingType = {
  enabled: false,
  currency: null
};

export function getPrice(fromCurrency: string, toCurrency: string, tickers: Array<Ticker>) {
  return tickers.find(ticker => (ticker.from === fromCurrency) &&
    (ticker.to === toCurrency)).price;
};
