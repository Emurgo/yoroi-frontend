// @flow
import type { HandlerType } from './type';
import { refreshCurrentCoinPrice, getHistoricalCoinPrices } from '../../coinPrice';

export type HistoricalCoinPricesRequest = {|
  from: string,
  timestamps: Array<number>,
|};
export type HistoricalCoinPricesResponse = Array<$ReadOnly<{|
  From: string,
  To: string,
  Time: Date,
  Price: number,
|}>>;

export const GetHistoricalCoinPrices: HandlerType<
  HistoricalCoinPricesRequest, HistoricalCoinPricesResponse
> = Object.freeze({
  typeTag: 'get-historical-coin-prices',

  handle: async (request) => {
    return await getHistoricalCoinPrices(request);
  },
});


export const RefreshCurrentCoinPrice: HandlerType<void, void> = Object.freeze({
  typeTag: 'refresh-current-coin-price',

  handle: async (_request) => {
    refreshCurrentCoinPrice('UI');
  },
});

