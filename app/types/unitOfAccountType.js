// @flow

export type UnitOfAccountSettingType = {|
  enabled: true,
  currency: string,
|} | {|
  enabled: false,
  currency: ?string
|};

export type Ticker = {|
  from: string, // source currency symbol
  to: string,   // target currency symbol
  price: number,
|};

export const unitOfAccountDisabledValue: UnitOfAccountSettingType = {
  enabled: false,
  currency: null
};

export function getPrice(fromCurrency: string, toCurrency: string, tickers: Array<Ticker>): number|null {
  const ticker = tickers.find(ticker => 
    (ticker.from === fromCurrency) &&
    (ticker.to === toCurrency));
  if (!ticker) {
    return null;
  }
  return ticker.price;
};
