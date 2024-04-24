// @flow

import type {
  AddressUtxoRequest,
  AddressUtxoResponse,
  HistoryRequest,
  HistoryResponse,
  RewardHistoryRequest,
  RewardHistoryResponse,
  AccountStateRequest,
  AccountStateResponse,
  SignedRequest,
  SignedResponse,
  PoolInfoRequest,
  PoolInfoResponse,
  CatalystRoundInfoRequest,
  CatalystRoundInfoResponse,
  BestBlockRequest,
  BestBlockResponse,
  TokenInfoRequest,
  TokenInfoResponse,
  MultiAssetRequest,
  MultiAssetMintMetadataResponse,
  GetUtxoDataRequest,
  GetUtxoDataResponse,
  GetLatestBlockBySlotReq,
  GetLatestBlockBySlotRes,
  GetRecentTransactionHashesRequest,
  GetRecentTransactionHashesResponse,
  GetTransactionsByHashesRequest,
  GetTransactionsByHashesResponse,
  MultiAssetSupplyResponse,
  FilterUsedRequest,
  FilterUsedResponse,
  GetSwapFeeTiersFunc,
} from './types';

export interface IFetcher {
  getUTXOsForAddresses(body: AddressUtxoRequest): Promise<AddressUtxoResponse>;
  getTransactionsHistoryForAddresses(body: HistoryRequest): Promise<HistoryResponse>;
  getRewardHistory(body: RewardHistoryRequest): Promise<RewardHistoryResponse>;
  getBestBlock(body: BestBlockRequest): Promise<BestBlockResponse>;
  sendTx(body: SignedRequest): Promise<SignedResponse>;
  getAccountState(body: AccountStateRequest): Promise<AccountStateResponse>;
  getPoolInfo(body: PoolInfoRequest): Promise<PoolInfoResponse>;
  getCatalystRoundInfo(body: CatalystRoundInfoRequest): Promise<CatalystRoundInfoResponse>;
  getTokenInfo(body: TokenInfoRequest): Promise<TokenInfoResponse>;
  checkAddressesInUse(body: FilterUsedRequest): Promise<FilterUsedResponse>;
  getMultiAssetMintMetadata(body: MultiAssetRequest)
    : Promise<MultiAssetMintMetadataResponse>;
  getMultiAssetSupply(body: MultiAssetRequest)
    : Promise<MultiAssetSupplyResponse>;
  getUtxoData(body: GetUtxoDataRequest): Promise<GetUtxoDataResponse>;
  getLatestBlockBySlot(body: GetLatestBlockBySlotReq): Promise<GetLatestBlockBySlotRes>;
  getRecentTransactionHashes
    : GetRecentTransactionHashesRequest => Promise<GetRecentTransactionHashesResponse>;
  getTransactionsByHashes
    : GetTransactionsByHashesRequest => Promise<GetTransactionsByHashesResponse>;
  getSwapFeeTiers
    : GetSwapFeeTiersFunc;
}
