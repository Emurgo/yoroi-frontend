// @flow

import type {
  UTXO,
  Transaction
} from '../../adaTypes';
import { RustModule } from '../cardanoCrypto/rustLoader';

// getUTXOsForAddresses

export type AddressUtxoRequest = {
  addresses: Array<string>,
};
export type AddressUtxoResponse = Array<UTXO>;
export type AddressUtxoFunc = (body: AddressUtxoRequest) => Promise<AddressUtxoResponse>;

// getTxsBodiesForUTXOs

export type TxBodiesRequest = { txsHashes: Array<string> };
export type TxBodiesResponse = {
  [key: string]:string
};
export type TxBodiesFunc = (body: TxBodiesRequest) => Promise<TxBodiesResponse>;

// getUTXOsSumsForAddresses

export type UtxoSumRequest = {
  addresses: Array<string>,
};
export type UtxoSumResponse = {
  sum: ?string
};
export type UtxoSumFunc = (body: UtxoSumRequest) => Promise<UtxoSumResponse>;

// getTransactionsHistoryForAddresses

export type HistoryRequest = {
  addresses: Array<string>,
  dateFrom: Date
};
export type HistoryResponse = Array<Transaction>;
export type HistoryFunc = (body: HistoryRequest) => Promise<HistoryResponse>;

// sendTx

export type SignedRequest = {
  signedTx: RustModule.Wallet.SignedTransaction
};
export type SignedResponse = {
  txId: string
};
export type SendFunc = (body: SignedRequest) => Promise<SignedResponse>;

// checkAddressesInUse

export type FilterUsedRequest = {
  addresses: Array<string>
};
export type FilterUsedResponse = Array<string>;
export type FilterFunc = (body: FilterUsedRequest) => Promise<FilterUsedResponse>;

// checkServer

export type ServerStatusResponse = {
  isServerOk: boolean
};
export type ServerStatusFunc = () => Promise<ServerStatusResponse>;

// getCurrentCoinPrice

type Ticker = {|
  from: string,
  to: string,
  price: number
|};

export type CurrentCoinPriceRequest = {|
  from: string
|};
export CurrentCoinPriceResponse = {|
  error: ?string,
  timestamp?: number,
  tickers?: Array<Ticker>
|};
export type CoinPriceFunc = (body: CurrentPriceRequest) => Promise<CurrentCoinPriceResponse>;

// getHistoricalCoinPrice

export type HistoricalCoinPriceRequest = {|
  from: string,
  timestamps: Array<number>
|};
export HistoricalCoinPriceResponse = {|
  error: ?string,
  timestamped_tickers?: Array<{|
    timestamp?: number,
    tickers?: Array<Ticker>
  |}
|};
export type CoinPriceFunc = (body: CurrentPriceRequest) => Promise<CurrentCoinPriceResponse>;
