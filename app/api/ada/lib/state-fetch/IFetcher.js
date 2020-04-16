// @flow

import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  RewardHistoryRequest, RewardHistoryResponse,
  SignedRequest, SignedResponse,
  FilterUsedRequest, FilterUsedResponse,
  BestBlockRequest, BestBlockResponse,
  ServerStatusRequest, ServerStatusResponse,
  AccountStateRequest, AccountStateResponse,
  PoolInfoRequest, PoolInfoResponse,
  ReputationRequest, ReputationResponse,
  CurrentCoinPriceRequest, CurrentCoinPriceResponse,
  HistoricalCoinPriceRequest, HistoricalCoinPriceResponse,
} from './types';

export interface IFetcher {
  getUTXOsForAddresses(body: AddressUtxoRequest): Promise<AddressUtxoResponse>;
  getTxsBodiesForUTXOs(body: TxBodiesRequest): Promise<TxBodiesResponse>;
  getUTXOsSumsForAddresses(body: UtxoSumRequest): Promise<UtxoSumResponse>;
  getTransactionsHistoryForAddresses(body: HistoryRequest): Promise<HistoryResponse>;
  getRewardHistory(body: RewardHistoryRequest): Promise<RewardHistoryResponse>;
  getBestBlock(body: BestBlockRequest): Promise<BestBlockResponse>;
  sendTx(body: SignedRequest): Promise<SignedResponse>;
  checkAddressesInUse(body: FilterUsedRequest): Promise<FilterUsedResponse>;
  checkServerStatus(body: ServerStatusRequest): Promise<ServerStatusResponse>;
  getAccountState(body: AccountStateRequest): Promise<AccountStateResponse>;
  getPoolInfo(body: PoolInfoRequest): Promise<PoolInfoResponse>;
  getReputation(body: ReputationRequest): Promise<ReputationResponse>;
  getCurrentCoinPrice(body: CurrentCoinPriceRequest): Promise<CurrentCoinPriceResponse>;
  getHistoricalCoinPrice(body: HistoricalCoinPriceRequest): Promise<HistoricalCoinPriceResponse>;
}
