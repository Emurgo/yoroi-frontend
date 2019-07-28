// @flow

// Handles interfacing with & updating the LovefieldDB for things related to historic transactions

import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import type { FilterFunc, HistoryFunc } from '../lib/state-fetch/types';
import type {
  GetAddressListFunc,
  SaveAsAdaAddressesFunc,
  UpdateBestBlockNumberFunc,
} from '../lib/storage/types';
import {
  UpdateAdaTxsHistoryError,
} from '../errors';
import type {
  AdaTransaction,
  Transaction
} from '../adaTypes';
import {
  scanAndSaveAddresses
} from '../restoreAdaWallet';
import type { ConfigType } from '../../../../config/config-types';

import { RustModule } from '../lib/cardanoCrypto/rustLoader';

declare var CONFIG : ConfigType;

/** Make backend-service calls to update any missing transactions in lovefieldDB
 * Additionally add new addresses to DB to remain BIP-44 complaint
 */
export async function refreshTxs(
  accountPublicKey: RustModule.Wallet.Bip44AccountPublic,
  accountIndex: number,
  existingTransactions: Array<AdaTransaction>,
  getTransactionsHistoryForAddresses: HistoryFunc,
  checkAddressesInUse: FilterFunc,
  updateBestBlockNumber: UpdateBestBlockNumberFunc,
  getAddressList: GetAddressListFunc,
  saveAsAdaAddresses: SaveAsAdaAddressesFunc,
  lastUsedInternal: number,
  lastUsedExternal: number,
): Promise<Array<Transaction>> {
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

  await scanAndSaveAddresses(
    accountPublicKey,
    accountIndex,
    'Internal',
    lastUsedInternal,
    checkAddressesInUse,
    saveAsAdaAddresses,
  );
  await scanAndSaveAddresses(
    accountPublicKey,
    accountIndex,
    'External',
    lastUsedExternal,
    checkAddressesInUse,
    saveAsAdaAddresses,
  );

  try {
    /**
     * Note: we refresh both chains at the same time because of how we optimize requests
     * We only query the backend for transactions that happened AFTER the latest we've ever seen
     * If you want to split this function into two: one for Internal and one for External
     * You also need to split this optimization such that
     * 1) It queries for all txs after the last tx that includes an Internal
     * 2) It queries for all txs after the last tx that includes an External
     */
    const addresses = await getAddressList();
    const newTxs = await _updateAdaTxsHistory(
      existingTransactions,
      addresses,
      getTransactionsHistoryForAddresses,
      updateBestBlockNumber,
    );

    return newTxs;
  } catch (error) {
    Logger.error(
      'adaTransactionsHistory::refreshTxs ' + JSON.stringify(error)
    );
    throw new UpdateAdaTxsHistoryError();
  }
}

/**
 * @requires existingTransactions should be ordered descendingly by ctmUpdate
 */
async function _updateAdaTxsHistory(
  existingTransactions: Array<AdaTransaction>,
  addresses: Array<string>,
  getTransactionsHistoryForAddresses: HistoryFunc,
  updateBestBlockNumber: UpdateBestBlockNumberFunc,
): Promise<Array<Transaction>> {
  try {
    // optimization: look for new transactions AFTER the timestamp of the last transaction received
    const dateFrom = existingTransactions.length > 0
      ? existingTransactions[0].ctMeta.ctmUpdate
      : new Date(0);

    const mappedTxs = await getTransactionsHistoryForAddresses({ addresses, dateFrom });
    const bestBlockNum = Math.max(...mappedTxs.map(tx => Number(tx.best_block_num)));
    await updateBestBlockNumber({ bestBlockNum });

    return mappedTxs;
  } catch (error) {
    Logger.error('adaTransactionsHistory::updateAdaTxsHistory error: ' + stringifyError(error));
    throw new UpdateAdaTxsHistoryError();
  }
}
