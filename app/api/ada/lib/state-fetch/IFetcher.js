// @flow

import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  SignedRequest, SignedResponse,
  FilterUsedRequest, FilterUsedResponse,
  BestBlockRequest, BestBlockResponse,
  ServerStatusRequest, ServerStatusResponse,
} from './types';

export interface IFetcher {
  getUTXOsForAddresses(body: AddressUtxoRequest): Promise<AddressUtxoResponse>;
  getTxsBodiesForUTXOs(body: TxBodiesRequest): Promise<TxBodiesResponse>;
  getUTXOsSumsForAddresses(body: UtxoSumRequest): Promise<UtxoSumResponse>;
  getTransactionsHistoryForAddresses(body: HistoryRequest): Promise<HistoryResponse>;
  getBestBlock(body: BestBlockRequest): Promise<BestBlockResponse>;
  sendTx(body: SignedRequest): Promise<SignedResponse>;
  checkAddressesInUse(body: FilterUsedRequest): Promise<FilterUsedResponse>;
  checkServerStatus(body: ServerStatusRequest): Promise<ServerStatusResponse>;
}
