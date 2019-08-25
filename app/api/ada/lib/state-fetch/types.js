// @flow

import type {
  RemoteUnspentOutput,
  RemoteTransaction
} from '../../adaTypes';
import { RustModule } from '../cardanoCrypto/rustLoader';

// getUTXOsForAddresses

export type AddressUtxoRequest = {
  addresses: Array<string>,
};
export type AddressUtxoResponse = Array<RemoteUnspentOutput>;
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

export type HistoryRequest = {|
  addresses: Array<string>,
  after?: {|
    block: string,
    tx: string,
  |},
  untilBlock: string,
|};
export type HistoryResponse = Array<RemoteTransaction>;
export type HistoryFunc = (body: HistoryRequest) => Promise<HistoryResponse>;

// getBestBlock

export type BestBlockRequest = void;
export type BestBlockResponse = {
  height: number, // 0 if no blocks in db
  // null when no blocks in db
  epoch: null | number,
  slot: null | number,
  hash: null | string,
};
export type BestBlockFunc = (body: BestBlockRequest) => Promise<BestBlockResponse>;

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

export type ServerStatusRequest = void;
export type ServerStatusResponse = {
  isServerOk: boolean
};
export type ServerStatusFunc = (body: ServerStatusRequest) => Promise<ServerStatusResponse>;
