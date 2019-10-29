// @flow

import BigNumber from 'bignumber.js';
import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  SignedRequest, SignedResponse,
  FilterUsedRequest, FilterUsedResponse,
  BestBlockRequest, BestBlockResponse,
  ServerStatusRequest, ServerStatusResponse,
  AddressUtxoFunc,
  FilterFunc,
  HistoryFunc,
  TxBodiesFunc,
  UtxoSumFunc,
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
} from '../../errors';
import {
  Logger,
  stringifyError
} from '../../../../utils/logging';

import type { ConfigType } from '../../../../../config/config-types';
import config from '../../../../config';

declare var CONFIG: ConfigType;
const addressesLimit = CONFIG.app.addressRequestSize;
const transactionsLimit: number = config.wallets.TRANSACTION_REQUEST_SIZE;

/**
 * Makes calls to Yoroi backend service
 * https://github.com/Emurgo/yoroi-backend-service/
 */
export class BatchedFetcher implements IFetcher {

  baseFetcher: IFetcher;

  constructor(baseFetcher: IFetcher) {
    this.baseFetcher = baseFetcher;
  }

  getUTXOsForAddresses = (body: AddressUtxoRequest): Promise<AddressUtxoResponse> => (
    batchUTXOsForAddresses(this.baseFetcher.getUTXOsForAddresses)(body)
  )

  getTxsBodiesForUTXOs = (body: TxBodiesRequest): Promise<TxBodiesResponse> => (
    batchTxsBodiesForInputs(this.baseFetcher.getTxsBodiesForUTXOs)(body)
  )

  getUTXOsSumsForAddresses = (body: UtxoSumRequest): Promise<UtxoSumResponse> => (
    batchGetUTXOsSumsForAddresses(this.baseFetcher.getUTXOsSumsForAddresses)(body)
  )

  getTransactionsHistoryForAddresses = (body: HistoryRequest): Promise<HistoryResponse> => (
    batchGetTransactionsHistoryForAddresses(
      this.baseFetcher.getTransactionsHistoryForAddresses
    )(body)
  )

  getBestBlock = (body: BestBlockRequest): Promise<BestBlockResponse> => (
    // We don't batch transaction sending (it's just a single requeset)
    this.baseFetcher.getBestBlock(body)
  )

  sendTx = (body: SignedRequest): Promise<SignedResponse> => (
    // We don't batch transaction sending (it's just a single requeset)
    // TODO: Should we support batching a list of transactions?
    this.baseFetcher.sendTx(body)
  )

  checkAddressesInUse = (body: FilterUsedRequest): Promise<FilterUsedResponse> => (
    batchCheckAddressesInUse(this.baseFetcher.checkAddressesInUse)(body)
  )

  checkServerStatus = (body: ServerStatusRequest): Promise<ServerStatusResponse> => (
    this.baseFetcher.checkServerStatus(body)
  )
}

/** Sum up the UTXO for a list of addresses by batching backend requests */
function batchUTXOsForAddresses(
  getUTXOsForAddresses: AddressUtxoFunc,
): AddressUtxoFunc {
  return async function (body) {
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
  return async function (body) {
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
  return async function (body) {
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
            partialAmount.sum != null // undefined if no addresses in the batch has any balance
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

export function batchGetTransactionsHistoryForAddresses(
  getTransactionsHistoryForAddresses: HistoryFunc,
): HistoryFunc {
  return async function (body: HistoryRequest) {
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
  // TODO: verify the latest block of each group is still in the blockchain
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
  if (history.length === transactionsLimit) {
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
  return async function (body) {
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
