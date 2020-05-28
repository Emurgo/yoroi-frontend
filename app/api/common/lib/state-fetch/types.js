// @flow

// checkServer

export type ServerStatusRequest = void;
export type ServerStatusResponse = {|
  isServerOk: boolean,
  isMaintenance: boolean,
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
