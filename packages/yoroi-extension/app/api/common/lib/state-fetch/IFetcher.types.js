// @flow

import type {
  ServerStatusRequest, ServerStatusResponse,
  CurrentCoinPriceRequest, CurrentCoinPriceResponse,
  HistoricalCoinPriceRequest, HistoricalCoinPriceResponse,
} from './types';

export interface IFetcher {
  checkServerStatus(body: ServerStatusRequest): Promise<ServerStatusResponse>;
  getCurrentCoinPrice(body: CurrentCoinPriceRequest): Promise<CurrentCoinPriceResponse>;
  getHistoricalCoinPrice(body: HistoricalCoinPriceRequest): Promise<HistoricalCoinPriceResponse>;
}
