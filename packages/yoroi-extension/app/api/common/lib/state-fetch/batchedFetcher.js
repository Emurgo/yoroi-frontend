// @flow

import type {
  ServerStatusRequest, ServerStatusResponse,
  CurrentCoinPriceRequest, CurrentCoinPriceResponse,
  HistoricalCoinPriceRequest, HistoricalCoinPriceResponse,
} from './types';

import type { IFetcher } from './IFetcher.types';

/**
 * Makes calls to Yoroi backend service
 * https://github.com/Emurgo/yoroi-backend-service/
 */
export class BatchedFetcher implements IFetcher {

  baseFetcher: IFetcher;

  constructor(baseFetcher: IFetcher) {
    this.baseFetcher = baseFetcher;
  }

  checkServerStatus: ServerStatusRequest => Promise<ServerStatusResponse> = (body) => (
    this.baseFetcher.checkServerStatus(body)
  )

  getCurrentCoinPrice: CurrentCoinPriceRequest => Promise<CurrentCoinPriceResponse> = (body) => (
    this.baseFetcher.getCurrentCoinPrice(body)
  )

  getHistoricalCoinPrice: HistoricalCoinPriceRequest => Promise<HistoricalCoinPriceResponse> = (
    body
  )  => (
    this.baseFetcher.getHistoricalCoinPrice(body)
  )
}
