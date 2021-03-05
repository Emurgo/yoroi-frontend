// @flow

import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  SignedRequest, SignedResponse,
  BestBlockRequest, BestBlockResponse,
  AssetInfoRequest, AssetInfoResponse,
} from './types';
import type {
  FilterUsedRequest, FilterUsedResponse,
} from '../../../common/lib/state-fetch/currencySpecificTypes';

export interface IFetcher {
  getUTXOsForAddresses(body: AddressUtxoRequest): Promise<AddressUtxoResponse>;
  getTxsBodiesForUTXOs(body: TxBodiesRequest): Promise<TxBodiesResponse>;
  getUTXOsSumsForAddresses(body: UtxoSumRequest): Promise<UtxoSumResponse>;
  getTransactionsHistoryForAddresses(body: HistoryRequest): Promise<HistoryResponse>;
  getBestBlock(body: BestBlockRequest): Promise<BestBlockResponse>;
  sendTx(body: SignedRequest): Promise<SignedResponse>;
  checkAddressesInUse(body: FilterUsedRequest): Promise<FilterUsedResponse>;
  getAssetInfo(body: AssetInfoRequest): Promise<AssetInfoResponse>;
}
