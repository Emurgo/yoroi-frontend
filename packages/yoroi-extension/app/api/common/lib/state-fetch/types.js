// @flow

import type { NetworkRow } from '../../../ada/lib/storage/database/primitives/tables';

export type BackendNetworkInfo = {|
  network: $ReadOnly<NetworkRow>,
|};

// checkServer

export type ServerStatusRequest = {|
  backend: string,
|};
export type ServerStatusResponse = {|
  isServerOk: boolean,
  isMaintenance: boolean,
  serverTime: number, // in milliseconds
  parallelSync?: ?boolean,
|};
export type ServerStatusFunc = (body: ServerStatusRequest) => Promise<ServerStatusResponse>;

// getCurrentCoinPrice

export type ResponseTicker = {|
  from: string,
  timestamp: number,
  signature?: string,
  prices: { [targetCurrency:string]: number, ... }
|};

export type CurrentCoinPriceRequest = {|
  from: string
|};
export type CurrentCoinPriceResponse = {|
  error: ?string,
  ticker: ResponseTicker,
  pubKeyData?: string,
  pubKeyDataSignature?: string,
|};
export type CurrentCoinPriceFunc =
  (body: CurrentCoinPriceRequest) => Promise<CurrentCoinPriceResponse>;

// getHistoricalCoinPrice

export type HistoricalCoinPriceRequest = {|
  from: string,
  timestamps: Array<number>
|};
export type HistoricalCoinPriceResponse = {|
  error: ?string,
  tickers: Array<ResponseTicker>
|};
export type HistoricalCoinPriceFunc =
  (body: HistoricalCoinPriceRequest) => Promise<HistoricalCoinPriceResponse>;
