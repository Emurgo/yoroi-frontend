// @flow

// Handles interfacing with & updating the LovefieldDB for things related to historic transactions

import _ from 'lodash';
import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import {
  getTransactionsHistoryForAddresses
} from '../lib/yoroi-backend-api';
import {
  saveTxs,
  getTxsOrderedByDateDesc,
  getTxsOrderedByLastUpdateDesc,
  getTxsLastUpdatedDate,
  getPendingTxs
} from '../lib/lovefieldDatabase';
import {
  mapToAdaTxs,
  getLatestUsedIndex
} from '../lib/utils';
import {
  getAdaAddressesByType,
  getAdaAddressesList,
} from '../adaAddress';
import {
  UpdateAdaTxsHistoryError,
} from '../errors';
import type
{
  AddressType,
  AdaTransaction,
  AdaTransactions,
  Transaction
} from '../adaTypes';
import {
  scanAndSaveAddresses
} from '../restoreAdaWallet';
import {
  saveLastBlockNumber,
  getLastBlockNumber,
  getCurrentCryptoAccount
} from '../adaLocalStorage';
import type {
  CryptoAccount,
} from '../adaLocalStorage';
import type { ConfigType } from '../../../../config/config-types';
import config from '../../../config';

declare var CONFIG : ConfigType;
const addressesLimit = CONFIG.app.addressRequestSize;
const transactionsLimit = config.wallets.TRANSACTION_REQUEST_SIZE;

/** Get all txs for wallet (every account) sorted by date */
export const getAdaTxsHistoryByWallet = async (): Promise<AdaTransactions> => {
  const transactions = await getTxsOrderedByDateDesc();
  return Promise.resolve([transactions, transactions.length]);
};

/** Get date of most recent update or return the start of epoch time if no txs exist. */
export const getAdaTxLastUpdatedDate = async (): Promise<Date> => getTxsLastUpdatedDate();

/** Make backend-service calls to update any missing transactions in lovefieldDB
 * Additionally add new addresses to DB to remain BIP-44 complaint
 */
export async function refreshTxs(): Promise<void> {
  const account = getCurrentCryptoAccount();

  /**
  * We have to make backend calls to check which of our addresses are used
  * This is because if many txs were made since the last time we synced,
  * there may be txs that contain addresses we own far beyond the bipp4 gap size
  * Therefore we need to check for this and possibly create new local addresses
  * that way they are recognized as belonging to us when we save the transactions
  *
  * We need to refresh the txs for each chain AFTER refreshing the addresses for each chain
  * This is because transactions in these chains are not mutually exclusive
  * in the case of interwallet transaction
  * Therefore we need to make sure necessary addresses are generated in both chains
  * to ensure they are correctly detected as ours
  */
  await syncAddresses(account, 'Internal');
  await syncAddresses(account, 'External');

  await refreshChains();
}

async function refreshChains(): Promise<void> {
  try {
    /**
     * Note: we refresh both chains at the same time because of how we optimize requests
     * We only query the backend for transactions that happened AFTER the latest we've ever seen
     * If you want to split this function into two: one for Internal and one for External
     * You also need to split this optimization such that
     * 1) It queries for all txs after the last tx that includes an Internal
     * 2) It queries for all txs after the last tx that includes an External
     */
    const adaAddresses = await getAdaAddressesList();
    const rawAddresses: Array<string> = adaAddresses.map(addr => addr.cadId);

    const newTxs = await _updateAdaTxsHistory(
      await getTxsOrderedByLastUpdateDesc(), rawAddresses
    );

    // save transactions in lovefieldDB
    const transactions = mapToAdaTxs(newTxs, rawAddresses);
    await saveTxs(transactions);
  } catch (error) {
    Logger.error(
      'adaTransactionsHistory::refreshChains' + JSON.stringify(error)
    );
    throw new UpdateAdaTxsHistoryError();
  }
}

async function syncAddresses(
  cryptoAccount: CryptoAccount,
  type: AddressType,
) {
  // optimize backend call by only checking the isUsed status of addresses we know aren't used
  const adaAddresses = await getAdaAddressesByType(type);
  const prevLatest = getLatestUsedIndex(adaAddresses);

  await scanAndSaveAddresses(
    cryptoAccount,
    type,
    prevLatest
  );
}

/** Wrapper function for LovefieldDB call to get all pendings transactions */
export function getPendingAdaTxs(): Promise<Array<AdaTransaction>> {
  return getPendingTxs();
}

/**
 * Make backend-service calls on set of addresses to update any missing transactions in lovefieldDB
 * @requires existingTransactions should be ordered descendingly by ctmUpdate
 */
async function _updateAdaTxsHistory(
  existingTransactions: Array<AdaTransaction>,
  addresses: Array<string>
): Promise<Array<Transaction>> {
  try {
    // optimization: look for new transactions AFTER the timestamp of the last transaction received
    const dateFrom = existingTransactions.length > 0
      ? existingTransactions[0].ctMeta.ctmUpdate
      : new Date(0);

    // send batched requests to get transaction history for addresses
    const mappedTxs = await _getTxsForChunksOfAddresses(addresses, groupOfAddresses => (
      _updateAdaTxsHistoryForGroupOfAddresses([], groupOfAddresses, dateFrom)
    ));

    return mappedTxs;
  } catch (error) {
    Logger.error('adaTransactionsHistory::updateAdaTxsHistory error: ' + stringifyError(error));
    throw new UpdateAdaTxsHistoryError();
  }
}

/** Split API call on list of addresses into batched requests */
async function _getTxsForChunksOfAddresses(
  addresses: Array<string>,
  apiCall: (Array<string>) => Promise<Array<Transaction>>
): Promise<Array<Transaction>> {
  const groupsOfAddresses = _.chunk(addresses, addressesLimit);
  const groupedTxsPromises = groupsOfAddresses.map(apiCall);
  const groupedTxs = await Promise.all(groupedTxsPromises);
  return groupedTxs.reduce((accum, chunkTxs) => accum.concat(chunkTxs), []);
}

/** Recursively fetch transaction history for a set of addresses from backend API
  * At the same time, update best block saved in local storage
*/
async function _updateAdaTxsHistoryForGroupOfAddresses(
  previousTxs: Array<Transaction>,
  groupOfAddresses: Array<string>,
  dateFrom: Date,
): Promise<Array<Transaction>> {
  /* We want to get the transaction history of a list of addresses
   * Howevever, the backend API has a limited size in its response
   * Therefore we keep calling it repeatedly until we get the full history.
  */

  // Move cutoff date forward to make progress on recursive calls
  const updatedDateFrom = previousTxs.length > 0
    ? new Date(previousTxs[previousTxs.length - 1].last_update)
    : dateFrom;

  // Get historic transactions from backend API
  const history = await getTransactionsHistoryForAddresses({
    addresses: groupOfAddresses,
    dateFrom: updatedDateFrom
  });

  // No more history left to fetch
  if (history.length === 0) {
    return previousTxs;
  }

  /* Update last block to best block in wallet history.
   * Note: Done for one tx as the best_block_num is the same for all txs in request
  */
  const bestBlockNum = Number(history[0].best_block_num);
  const lastKnownBlockNumber = getLastBlockNumber();
  if (!lastKnownBlockNumber || bestBlockNum > lastKnownBlockNumber) {
    saveLastBlockNumber(bestBlockNum);
  }

  // map database format for historic transactions to actual AdaTransaction format
  const transactions = previousTxs.concat(history);

  // If we reached the API limit, call API again to get more results
  if (history.length === transactionsLimit) {
    return await _updateAdaTxsHistoryForGroupOfAddresses(
      transactions,
      groupOfAddresses,
      dateFrom
    );
  }

  return transactions;
}
