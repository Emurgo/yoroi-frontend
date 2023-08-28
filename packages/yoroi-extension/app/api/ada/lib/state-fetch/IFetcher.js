// @flow

import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  RewardHistoryRequest, RewardHistoryResponse,
  AccountStateRequest, AccountStateResponse,
  SignedRequest, SignedResponse,
  PoolInfoRequest, PoolInfoResponse,
  CatalystRoundInfoRequest, CatalystRoundInfoResponse,
  BestBlockRequest, BestBlockResponse,
  TokenInfoRequest, TokenInfoResponse,
  MultiAssetMintMetadataRequest, MultiAssetMintMetadataResponse,
  GetUtxoDataRequest, GetUtxoDataResponse,
  GetLatestBlockBySlotReq, GetLatestBlockBySlotRes,
  GetRecentTransactionHashesRequest, GetRecentTransactionHashesResponse,
  GetTransactionsByHashesRequest, GetTransactionsByHashesResponse,
} from './types';
import type {
  FilterUsedRequest, FilterUsedResponse,
} from '../../../common/lib/state-fetch/currencySpecificTypes';

export interface IFetcher {
  getUTXOsForAddresses(body: AddressUtxoRequest): Promise<AddressUtxoResponse>;
  getTxsBodiesForUTXOs(body: TxBodiesRequest): Promise<TxBodiesResponse>;
  getUTXOsSumsForAddresses(body: UtxoSumRequest): Promise<UtxoSumResponse>;
  getTransactionsHistoryForAddresses(body: HistoryRequest): Promise<HistoryResponse>;
  getRewardHistory(body: RewardHistoryRequest): Promise<RewardHistoryResponse>;
  getBestBlock(body: BestBlockRequest): Promise<BestBlockResponse>;
  sendTx(body: SignedRequest): Promise<SignedResponse>;
  getAccountState(body: AccountStateRequest): Promise<AccountStateResponse>;
  getPoolInfo(body: PoolInfoRequest): Promise<PoolInfoResponse>;
  getCatalystRoundInfo(body: CatalystRoundInfoRequest): Promise<CatalystRoundInfoResponse>;
  getTokenInfo(body: TokenInfoRequest): Promise<TokenInfoResponse>;
  checkAddressesInUse(body: FilterUsedRequest): Promise<FilterUsedResponse>;
  getMultiAssetMintMetadata(body: MultiAssetMintMetadataRequest)
    : Promise<MultiAssetMintMetadataResponse>;
  getUtxoData(body: GetUtxoDataRequest): Promise<GetUtxoDataResponse>;
  getLatestBlockBySlot(body: GetLatestBlockBySlotReq): Promise<GetLatestBlockBySlotRes>;
  getRecentTransactionHashes
    : GetRecentTransactionHashesRequest => Promise<GetRecentTransactionHashesResponse>;
  getTransactionsByHashes
    : GetTransactionsByHashesRequest => Promise<GetTransactionsByHashesResponse>;

}
