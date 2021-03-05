// @flow

import BigNumber from 'bignumber.js';
import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  SignedRequest, SignedResponse,
  BestBlockRequest, BestBlockResponse,
  AssetInfoRequest, AssetInfoResponse,
  AddressUtxoFunc,
  HistoryFunc,
  TxBodiesFunc,
  UtxoSumFunc,
  AssetInfoFunc,
  RemoteErgoTransaction,
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
  GetAssetInfoApiError,
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

/**
 * Makes calls to Yoroi backend service
 * https://github.com/Emurgo/yoroi-ergo-backend
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

  getAssetInfo: AssetInfoRequest => Promise<AssetInfoResponse> = (body) => (
    batchAssetInfo(this.baseFetcher.getAssetInfo)(body)
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
      const groupsOfTxsHashes = chunk(body.txHashes, CONFIG.app.txsBodiesRequestSize);

      // convert chunks into list of Promises that call the backend-service
      const promises = groupsOfTxsHashes
        .map(groupOfTxsHashes => getTxsBodiesForUTXOs({
          network: body.network,
          txHashes: groupOfTxsHashes,
        }));

      // Sum up all the utxo
      return Promise.all(promises)
        .then(groupsOfTxBodies => {
          const bodies = groupsOfTxBodies
            .reduce((acc, groupOfTxBodies) => Object.assign(acc, groupOfTxBodies), {});
          if (body.txHashes.length !== Object.keys(bodies).length) {
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
      return { sum: sum.toString() };
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchGetUTXOsSumsForAddresses)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GetUtxosSumsForAddressesApiError();
    }
  };
}

export function batchAssetInfo(
  getAssetInfo: AssetInfoFunc,
): AssetInfoFunc {
  return async function (body: AssetInfoRequest): Promise<AssetInfoResponse> {
    try {
      // batch all addresses into chunks for API
      const groupsOfAddresses = chunk(body.assetIds, addressesLimit);
      const promises =
        groupsOfAddresses.map(groupOfAssets => getAssetInfo({
          network: body.network,
          assetIds: groupOfAssets,
        }));
      const partialResponses: Array<AssetInfoResponse> = await Promise.all(promises);

      const result: AssetInfoResponse = {};
      for (const response of partialResponses) {
        for (const key of Object.keys(response)) {
          result[key] = response[key];
        }
      }
      return result;
    } catch (error) {
      Logger.error(`batchedFetcher::${nameof(batchAssetInfo)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new  GetAssetInfoApiError();
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
): Promise<Array<RemoteErgoTransaction>> {
  const groupsOfAddresses = chunk(addresses, addressesLimit);
  const groupedTxsPromises = groupsOfAddresses.map(apiCall);
  const groupedTxs = await Promise.all(groupedTxsPromises);
  // Note: all queries belong to the same chain since untilBlock is the same
  return groupedTxs.reduce((accum, chunkTxs) => accum.concat(chunkTxs), []);
}

async function _batchHistoryByTransaction(
  previousTxs: Array<RemoteErgoTransaction>,
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
      throw new Error(`${nameof(_batchHistoryByAddresses)} only pending/failed tx returned`);
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
  txs: Array<RemoteErgoTransaction>,
): void | TimeForTx {
  const blockInfo : Array<TimeForTx> = [];
  for (const tx of txs) {
    if (tx.block_hash != null && tx.tx_ordinal != null && tx.block_num != null) {
      blockInfo.push({
        blockHash: tx.block_hash,
        txHash: tx.hash,
        txOrdinal: tx.tx_ordinal,
        height: tx.block_num,
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
