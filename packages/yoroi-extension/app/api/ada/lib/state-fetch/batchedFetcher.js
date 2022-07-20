// @flow

import BigNumber from 'bignumber.js';
import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  RewardHistoryFunc, RewardHistoryRequest, RewardHistoryResponse,
  PoolInfoFunc, PoolInfoRequest, PoolInfoResponse,
  TokenInfoFunc, TokenInfoRequest, TokenInfoResponse,
  AccountStateFunc, AccountStateRequest, AccountStateResponse,
  CatalystRoundInfoFunc,CatalystRoundInfoRequest, CatalystRoundInfoResponse,
  SignedRequest, SignedResponse,
  BestBlockRequest, BestBlockResponse,
  AddressUtxoFunc,
  HistoryFunc,
  TxBodiesFunc,
  UtxoSumFunc,
  RemoteTransaction,
  MultiAssetMintMetadataRequest,
  MultiAssetMintMetadataResponse,
  GetUtxoDataFunc, GetUtxoDataRequest, GetUtxoDataResponse,
} from './types';
import type {
  FilterFunc, FilterUsedRequest, FilterUsedResponse,
} from '../../../common/lib/state-fetch/currencySpecificTypes';
import LocalizableError from '../../../../i18n/LocalizableError';

import type { IFetcher } from './IFetcher';

import { chunk } from 'lodash';
import {
  CheckAddressesInUseApiError,
  GetAllUTXOsForAddressesError,
  GetTxsBodiesForUTXOsError,
  GetUtxosSumsForAddressesApiError,
  GetTxHistoryForAddressesApiError,
  GetRewardHistoryApiError,
  GetAccountStateApiError,
  GetPoolInfoApiError,
  GetTokenInfoApiError,
} from '../../../common/errors';
import {
  Logger,
  stringifyError
} from '../../../../utils/logging';

import type { ConfigType } from '../../../../../config/config-types';
import config from '../../../../config';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const addressesLimit = CONFIG.app.addressRequestSize;

const MINT_METADATA_REQUEST_PAGE_SIZE = 100;

/**
 * Makes calls to Yoroi backend service
 * https://github.com/Emurgo/yoroi-graphql-migration-backend
 */
export class BatchedFetcher implements IFetcher {

  baseFetcher: IFetcher;

  constructor(baseFetcher: IFetcher) {
    this.baseFetcher = baseFetcher;
  }

  getUTXOsForAddresses: AddressUtxoRequest => Promise<AddressUtxoResponse> = (body) => (
    batchUTXOsForAddresses(this.baseFetcher.getUTXOsForAddresses)(body)
  )

  getTxsBodiesForUTXOs: TxBodiesRequest => Promise<TxBodiesResponse> = (body) => (
    batchTxsBodiesForInputs(this.baseFetcher.getTxsBodiesForUTXOs)(body)
  )

  getUTXOsSumsForAddresses: UtxoSumRequest => Promise<UtxoSumResponse> = (body) => (
    batchGetUTXOsSumsForAddresses(this.baseFetcher.getUTXOsSumsForAddresses)(body)
  )

  getTransactionsHistoryForAddresses: HistoryRequest => Promise<HistoryResponse> = (body) => (
    batchGetTransactionsHistoryForAddresses(
      this.baseFetcher.getTransactionsHistoryForAddresses
    )(body)
  )

  getRewardHistory: RewardHistoryRequest => Promise<RewardHistoryResponse> = (body) => (
    batchGetRewardHistory(
      this.baseFetcher.getRewardHistory
    )(body)
  )

  getBestBlock: BestBlockRequest => Promise<BestBlockResponse> = (body) => (
    // We don't batch transaction sending (it's just a single request)
    this.baseFetcher.getBestBlock(body)
  )

  sendTx: SignedRequest => Promise<SignedResponse> = (body) => (
    // We don't batch transaction sending (it's just a single request)
    // TODO: Should we support batching a list of transactions?
    this.baseFetcher.sendTx(body)
  )

  getMultiAssetMintMetadata
  : MultiAssetMintMetadataRequest => Promise<MultiAssetMintMetadataResponse>
    = async (body) => {
      const { network, assets } = body;
      const assetChunks = chunk(assets, MINT_METADATA_REQUEST_PAGE_SIZE);
      const responses = await Promise.all(assetChunks.map(
        chunk => this.baseFetcher.getMultiAssetMintMetadata({ network, assets: chunk })
      ));
      const result = {};
      for (const response of responses) {
        for (const [key, value] of Object.entries(response)) {
          result[key] = value;
        }
      }
      return result;
    }

  getAccountState: AccountStateRequest => Promise<AccountStateResponse> = (body) => (
    batchGetAccountState(this.baseFetcher.getAccountState)(body)
  )

  checkAddressesInUse: FilterUsedRequest => Promise<FilterUsedResponse> = (body) => (
    batchCheckAddressesInUse(this.baseFetcher.checkAddressesInUse)(body)
  )

  getPoolInfo: PoolInfoRequest => Promise<PoolInfoResponse> = (body) => (
    batchGetPoolInfo(this.baseFetcher.getPoolInfo)(body)
  )

  getTokenInfo: TokenInfoRequest => Promise<TokenInfoResponse> = (body) => (
    batchGetTokenInfo(this.baseFetcher.getTokenInfo)(body)
  )

  getCatalystRoundInfo: CatalystRoundInfoRequest => Promise<CatalystRoundInfoResponse> = (body) => (
    batchGetCatalystRoundInfo(this.baseFetcher.getCatalystRoundInfo)(body)
  )

  getUtxoData: GetUtxoDataRequest => Promise<GetUtxoDataResponse> = (body) => (
    batchGetUtxoData(this.baseFetcher.getUtxoData)(body)
  )
}

/** Sum up the UTXO for a list of addresses by batching backend requests */
function batchUTXOsForAddresses(
  getUTXOsForAddresses: AddressUtxoFunc,
): AddressUtxoFunc {
  return async function (body: AddressUtxoRequest): Promise<AddressUtxoResponse> {
    try {
      // split up all addresses into chunks of equal size
      const groupsOfAddresses: Array<Array<string>>
        = chunk(body.addresses, CONFIG.app.addressRequestSize);

      // convert chunks into list of Promises that call the backend-service
      const promises = groupsOfAddresses
        .map(groupOfAddresses => getUTXOsForAddresses({
          addresses: groupOfAddresses,
          network: body.network,
        }));

      // Sum up all the utxo
      return Promise.all(promises)
        .then(groupsOfUTXOs => (
          groupsOfUTXOs.reduce((acc, groupOfUTXOs) => acc.concat(groupOfUTXOs), [])
        ));
    } catch (error) {
      Logger.error(`batchedFetcher:::${nameof(batchUTXOsForAddresses)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GetAllUTXOsForAddressesError();
    }
  };
}

/** List of Body hashes for a list of utxos by batching backend requests */
function batchTxsBodiesForInputs(
  getTxsBodiesForUTXOs: TxBodiesFunc,
): TxBodiesFunc {
  return async function (body: TxBodiesRequest): Promise<TxBodiesResponse> {
    try {
      // split up all txs into chunks of equal size
      const groupsOfTxsHashes = chunk(body.txsHashes, CONFIG.app.txsBodiesRequestSize);

      // convert chunks into list of Promises that call the backend-service
      const promises = groupsOfTxsHashes
        .map(groupOfTxsHashes => getTxsBodiesForUTXOs({
          network: body.network,
          txsHashes: groupOfTxsHashes,
        }));

      // Sum up all the utxo
      return Promise.all(promises)
        .then(groupsOfTxBodies => {
          const bodies = groupsOfTxBodies
            .reduce((acc, groupOfTxBodies) => Object.assign(acc, groupOfTxBodies), {});
          if (body.txsHashes.length !== Object.keys(bodies).length) {
            throw new GetTxsBodiesForUTXOsError();
          }
          return bodies;
        });
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchTxsBodiesForInputs)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GetTxsBodiesForUTXOsError();
    }
  };
}

export function batchGetUTXOsSumsForAddresses(
  getUTXOsSumsForAddresses: UtxoSumFunc,
): UtxoSumFunc {
  return async function (body: UtxoSumRequest): Promise<UtxoSumResponse> {
    try {
      // batch all addresses into chunks for API
      const groupsOfAddresses = chunk(body.addresses, addressesLimit);
      const promises =
        groupsOfAddresses.map(groupOfAddresses => getUTXOsSumsForAddresses({
          network: body.network,
          addresses: groupOfAddresses,
        }));
      const partialAmounts: Array<UtxoSumResponse> = await Promise.all(promises);

      // sum all chunks together
      let sum: BigNumber = new BigNumber(0);
      const assetMap = new Map<string, ReadonlyElementOf<$PropertyType<UtxoSumResponse, 'assets'>>>();
      for (const partial of partialAmounts) {
        sum = sum.plus(
          partial.sum != null && partial.sum !== '' // undefined if no addresses in the batch has any balance
              ? new BigNumber(partial.sum)
              : new BigNumber(0)
        );
        for (const asset of partial.assets) {
          const currentVal = assetMap.get(asset.assetId)?.amount ?? '0';
          assetMap.set(
            asset.assetId,
            {
              ...asset,
              amount: new BigNumber(currentVal).plus(asset.amount).toString(),
            },
          );
        }
      }
      if (sum.isZero()) {
        return {
          sum: null,
          assets: [],
        };
      }
      return {
        sum: sum.toString(),
        assets: Array.from(assetMap.entries()).map(entry => ({
          ...entry[1]
        })),
      };
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchGetUTXOsSumsForAddresses)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GetUtxosSumsForAddressesApiError();
    }
  };
}

export function batchGetRewardHistory(
  getRewardHistory: RewardHistoryFunc,
): RewardHistoryFunc {
  return async function (body: RewardHistoryRequest): Promise<RewardHistoryResponse> {
    try {
      const chimericAccountAddresses = chunk(body.addresses, addressesLimit);
      const chimericAccountPromises = chimericAccountAddresses.map(
        addr => getRewardHistory({
          network: body.network,
          addresses: addr,
        })
      );
      const rewardHistories = await Promise.all(chimericAccountPromises);
      return Object.assign({}, ...rewardHistories);
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchGetRewardHistory)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GetRewardHistoryApiError();
    }
  };
}

export function batchGetTransactionsHistoryForAddresses(
  getTransactionsHistoryForAddresses: HistoryFunc,
): HistoryFunc {
  return async function (body: HistoryRequest): Promise<HistoryResponse> {
    try {
      // we need two levels of batching: addresses and then transactions
      const transactions = await _batchHistoryByAddresses(
        body.addresses,
        async (addresses) => (
          await _batchHistoryByTransaction(
            [],
            {
              ...body,
              addresses,
            },
            getTransactionsHistoryForAddresses,
          )
        )
      );
      const seenTxIds = new Set();
      const deduplicated = [];
      for (const tx of transactions) {
        if (seenTxIds.has(tx.hash)) {
          continue;
        }
        deduplicated.push(tx);
        seenTxIds.add(tx.hash);
      }
      return deduplicated;
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchGetTransactionsHistoryForAddresses)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GetTxHistoryForAddressesApiError();
    }
  };
}

async function _batchHistoryByAddresses(
  addresses: Array<string>,
  apiCall: (Array<string>) => Promise<HistoryResponse>,
): Promise<Array<RemoteTransaction>> {
  const groupsOfAddresses = chunk(addresses, addressesLimit);
  const groupedTxsPromises = groupsOfAddresses.map(apiCall);
  const groupedTxs = await Promise.all(groupedTxsPromises);
  // Note: all queries belong to the same chain since untilBlock is the same
  return groupedTxs.reduce((accum, chunkTxs) => accum.concat(chunkTxs), []);
}

async function _batchHistoryByTransaction(
  previousTxs: Array<RemoteTransaction>,
  request: HistoryRequest,
  getTransactionsHistoryForAddresses: HistoryFunc,
): Promise<HistoryResponse> {
  // Get historic transactions from backend API
  const history = await getTransactionsHistoryForAddresses(request);

  // No more history left to fetch
  if (history.length === 0) {
    return previousTxs;
  }

  const transactions = previousTxs.concat(history);

  // If we reached the API limit, call API again to get more results
  if (history.length === config.wallets.TRANSACTION_REQUEST_SIZE) {
    const newBest = getLatestTransaction(history);
    if (newBest === undefined) {
      // if we don't have a single tx in a block
      // we can't advance in pagination
      throw new Error('_batchHistoryByTransaction only pending/failed tx returned');
    }
    return await _batchHistoryByTransaction(
      transactions,
      {
        ...request,
        after: {
          block: newBest.blockHash,
          tx: newBest.txHash,
        }
      },
      getTransactionsHistoryForAddresses,
    );
  }

  return transactions;
}

export function batchCheckAddressesInUse(
  checkAddressesInUse: FilterFunc,
): FilterFunc {
  return async function (body: FilterUsedRequest): Promise<FilterUsedResponse> {
    try {
      const groupsOfAddresses = chunk(body.addresses, addressesLimit);
      const groupedAddrPromises = groupsOfAddresses.map(
        addr => checkAddressesInUse({
          network: body.network,
          addresses: addr,
        })
      );
      const groupedAddresses = await Promise.all(groupedAddrPromises);
      return groupedAddresses.reduce((accum, chunkAddrs) => accum.concat(chunkAddrs), []);
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchCheckAddressesInUse)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new CheckAddressesInUseApiError();
    }
  };
}

export type TimeForTx = {|
  blockHash: string,
  height: number,
  txHash: string,
  txOrdinal: number
|};
function getLatestTransaction(
  txs: Array<RemoteTransaction>,
): void | TimeForTx {
  const blockInfo : Array<TimeForTx> = [];
  for (const tx of txs) {
    if (tx.block_hash != null && tx.tx_ordinal != null && tx.height != null) {
      blockInfo.push({
        blockHash: tx.block_hash,
        txHash: tx.hash,
        txOrdinal: tx.tx_ordinal,
        height: tx.height,
      });
    }
  }
  if (blockInfo.length === 0) {
    return undefined;
  }
  let best = blockInfo[0];
  for (let i = 1; i < blockInfo.length; i++) {
    if (blockInfo[i].height > best.height) {
      best = blockInfo[i];
      continue;
    }
    if (blockInfo[i].height === best.height) {
      if (blockInfo[i].txOrdinal > best.txOrdinal) {
        best = blockInfo[i];
        continue;
      }
    }
  }
  return best;
}

export function batchGetAccountState(
  getAccountState: AccountStateFunc,
): AccountStateFunc {
  return async function (body: AccountStateRequest): Promise<AccountStateResponse> {
    try {
      const chimericAccountAddresses = chunk(body.addresses, addressesLimit);
      const chimericAccountPromises = chimericAccountAddresses.map(
        addr => getAccountState({
          network: body.network,
          addresses: addr,
        })
      );
      const chimericAccountStates = await Promise.all(chimericAccountPromises);
      return Object.assign({}, ...chimericAccountStates);
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchGetAccountState)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GetAccountStateApiError();
    }
  };
}
export function batchGetCatalystRoundInfo(
  getCatalystRoundInfo: CatalystRoundInfoFunc,
): CatalystRoundInfoFunc {
  return async function (body: CatalystRoundInfoRequest): any {
    try {
      return getCatalystRoundInfo(body)
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchGetAccountState)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GetAccountStateApiError();
    }
  };
}

export function batchGetPoolInfo(
  getPoolInfo: PoolInfoFunc,
): PoolInfoFunc {
  return async function (body: PoolInfoRequest): Promise<PoolInfoResponse> {
    try {
      const poolIds = chunk(body.poolIds, addressesLimit);
      const poolInfoPromises = poolIds.map(
        poolId => getPoolInfo({
          network: body.network,
          poolIds: poolId,
        })
      );
      const poolInfos = await Promise.all(poolInfoPromises);
      return Object.assign({}, ...poolInfos);
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchGetPoolInfo)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GetPoolInfoApiError();
    }
  };
}

export function batchGetTokenInfo(
  getTokenInfo: TokenInfoFunc,
): TokenInfoFunc {
  return async function (body: TokenInfoRequest): Promise<TokenInfoResponse> {
    try {
      const tokenIds = chunk(body.tokenIds, addressesLimit);
      const tokenInfoPromises = tokenIds.map(
        tokenId => getTokenInfo({
          network: body.network,
          tokenIds: tokenId,
        })
      );
      const tokenInfos = await Promise.all(tokenInfoPromises);
      return Object.assign({}, ...tokenInfos);
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchGetTokenInfo)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GetTokenInfoApiError();
    }
  };
}

function batchGetUtxoData(
  getUtxoData: GetUtxoDataFunc,
): GetUtxoDataFunc {
  return async function (body: GetUtxoDataRequest): Promise<GetUtxoDataResponse> {
    return (await Promise.all(
      body.utxos.map(
        ({ txHash, txIndex }) => getUtxoData(
          {
            network: body.network,
            utxos: [ { txHash, txIndex } ],
          }
        )
      )
    )).flat();
  };
}
