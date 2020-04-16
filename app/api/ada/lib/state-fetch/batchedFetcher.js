// @flow

import BigNumber from 'bignumber.js';
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
  AddressUtxoFunc,
  FilterFunc,
  HistoryFunc,
  RewardHistoryFunc,
  TxBodiesFunc,
  UtxoSumFunc,
  AccountStateFunc,
  PoolInfoFunc,
  ReputationFunc,
  RemoteTransaction,
} from './types';

import type { IFetcher } from './IFetcher';

import { chunk } from 'lodash';
import {
  CheckAdressesInUseApiError,
  GetAllUTXOsForAddressesError,
  GetTxsBodiesForUTXOsError,
  GetUtxosSumsForAddressesApiError,
  GetTxHistoryForAddressesApiError,
  GetRewardHistoryApiError,
  GetAccountStateApiError,
  GetPoolInfoApiError,
} from '../../errors';
import {
  Logger,
  stringifyError
} from '../../../../utils/logging';

import type { ConfigType } from '../../../../../config/config-types';
import config from '../../../../config';

declare var CONFIG: ConfigType;
const addressesLimit = CONFIG.app.addressRequestSize;

/**
 * Makes calls to Yoroi backend service
 * https://github.com/Emurgo/yoroi-backend-service/
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

  checkAddressesInUse: FilterUsedRequest => Promise<FilterUsedResponse> = (body) => (
    batchCheckAddressesInUse(this.baseFetcher.checkAddressesInUse)(body)
  )

  getAccountState: AccountStateRequest => Promise<AccountStateResponse> = (body) => (
    batchGetAccountState(this.baseFetcher.getAccountState)(body)
  )

  getReputation: ReputationRequest => Promise<ReputationResponse> = (body) => (
    batchGetReputation(this.baseFetcher.getReputation)(body)
  )

  getPoolInfo: PoolInfoRequest => Promise<PoolInfoResponse> = (body) => (
    batchGetPoolInfo(this.baseFetcher.getPoolInfo)(body)
  )

  checkServerStatus: ServerStatusRequest => Promise<ServerStatusResponse> = (body) => (
    this.baseFetcher.checkServerStatus(body)
  )

  getCurrentCoinPrice: CurrentCoinPriceRequest => Promise<CurrentCoinPriceResponse> = (body) => (
    this.baseFetcher.getCurrentCoinPrice(body)
  )

  getHistoricalCoinPrice: HistoricalCoinPriceRequest => Promise<HistoricalCoinPriceResponse> = (
    body
  )  => (
    this.baseFetcher.getHistoricalCoinPrice(body)
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
        .map(groupOfAddresses => getUTXOsForAddresses(
          { addresses: groupOfAddresses }
        ));

      // Sum up all the utxo
      return Promise.all(promises)
        .then(groupsOfUTXOs => (
          groupsOfUTXOs.reduce((acc, groupOfUTXOs) => acc.concat(groupOfUTXOs), [])
        ));
    } catch (getUtxosError) {
      Logger.error('batchedFetcher:::batchUTXOsForAddresses error: ' +
        stringifyError(getUtxosError));
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
        .map(groupOfTxsHashes => getTxsBodiesForUTXOs({ txsHashes: groupOfTxsHashes }));

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
    } catch (getTxBodiesError) {
      Logger.error('batchedFetcher::batchTxsBodiesForInputs error: ' +
        stringifyError(getTxBodiesError));
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
        groupsOfAddresses.map(groupOfAddresses => getUTXOsSumsForAddresses(
          { addresses: groupOfAddresses }
        ));
      const partialAmounts: Array<UtxoSumResponse> = await Promise.all(promises);

      // sum all chunks together
      const sum: BigNumber = partialAmounts.reduce(
        (acc: BigNumber, partialAmount) => (
          acc.plus(
            partialAmount.sum != null && partialAmount.sum !== '' // undefined if no addresses in the batch has any balance
              ? new BigNumber(partialAmount.sum)
              : new BigNumber(0)
          )
        ),
        new BigNumber(0)
      );
      if (sum.isZero()) {
        return { sum: null };
      }
      return { sum: sum.toString() };
    } catch (error) {
      Logger.error('batchedFetcher::batchGetUTXOsSumsForAddresses error: ' + stringifyError(error));
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
        addr => getRewardHistory({ addresses: addr })
      );
      const rewardHistories = await Promise.all(chimericAccountPromises);
      return Object.assign({}, ...rewardHistories);
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchGetRewardHistory)} error: ` + stringifyError(error));
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
      Logger.error('batchedFetcher::batchGetTransactionsHistoryForAddresses error: ' + stringifyError(error));
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
  // map database format for historic transactions to actual AdaTransaction format
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
        addr => checkAddressesInUse({ addresses: addr })
      );
      const groupedAddresses = await Promise.all(groupedAddrPromises);
      return groupedAddresses.reduce((accum, chunkAddrs) => accum.concat(chunkAddrs), []);
    } catch (error) {
      Logger.error('batchedFetcher::batchCheckAddressesInUse error: ' + stringifyError(error));
      throw new CheckAdressesInUseApiError();
    }
  };
}

export function batchGetAccountState(
  getAccountState: AccountStateFunc,
): AccountStateFunc {
  return async function (body: AccountStateRequest): Promise<AccountStateResponse> {
    try {
      const chimericAccountAddresses = chunk(body.addresses, addressesLimit);
      const chimericAccountPromises = chimericAccountAddresses.map(
        addr => getAccountState({ addresses: addr })
      );
      const chimericAccounutStates = await Promise.all(chimericAccountPromises);
      return Object.assign({}, ...chimericAccounutStates);
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchGetAccountState)} error: ` + stringifyError(error));
      throw new GetAccountStateApiError();
    }
  };
}

export function batchGetPoolInfo(
  getPoolInfo: PoolInfoFunc,
): PoolInfoFunc {
  return async function (body: PoolInfoRequest): Promise<PoolInfoResponse> {
    try {
      const poolIds = chunk(body.ids, addressesLimit);
      const poolInfoPromises = poolIds.map(
        addr => getPoolInfo({ ids: addr })
      );
      const poolInfos = await Promise.all(poolInfoPromises);
      return Object.assign({}, ...poolInfos);
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchGetPoolInfo)} error: ` + stringifyError(error));
      throw new GetPoolInfoApiError();
    }
  };
}

export function batchGetReputation(
  getReputation: ReputationFunc,
): ReputationFunc {
  return async function (body: ReputationRequest): Promise<ReputationResponse> {
    return getReputation(body);
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
  for (let i = 1; i < txs.length; i++) {
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
