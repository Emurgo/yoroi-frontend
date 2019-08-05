// @flow

export type CoinPriceCurrencySettingType = {|
  enabled: boolean,
  currency: ?string,
|};

export const coinPriceCurrencyDisabledValue: CoinPriceCurrencySettingType = {
  enabled: false,
  currency: null
};
