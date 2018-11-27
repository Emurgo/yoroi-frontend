// @flow

// Handles interfacing with & updating the LovefieldDB for things related to historic transactions

import _ from 'lodash';
import BigNumber from 'bignumber.js';
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
import type {
  TxAddressesTableRow,
  TxsTableRow
} from '../lib/lovefieldDatabase';
import {
  toAdaTx
} from '../lib/utils';
import {
  getAdaAddressesList
} from '../adaAddress';
import {
  UpdateAdaTxsHistoryError,
} from '../errors';
import type
{
  AdaTransaction,
  AdaTransactions,
  AdaTransactionInputOutput,
  Transaction
} from '../adaTypes';
import { saveLastBlockNumber, getLastBlockNumber } from '../adaLocalStorage';
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

/** Make backend-service calls to update any missing transactions in lovefieldDB */
export async function refreshTxs(): Promise<void> {
  try {
    const adaAddresses = await getAdaAddressesList();
    const addresses: Array<string> = adaAddresses.map(addr => addr.cadId);
    await _updateAdaTxsHistory(await getTxsOrderedByLastUpdateDesc(), addresses);
  } catch (error) {
    Logger.error('adaTransactionsHistory::refreshTxs error: ' + JSON.stringify(error));
    throw new UpdateAdaTxsHistoryError();
  }
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
): Promise<[Array<TxsTableRow>, Array<TxAddressesTableRow>]> {
  try {
    // optimization: look for new transactions AFTER the timestamp of the last transaction received
    const dateFrom = existingTransactions.length > 0
      ? existingTransactions[0].ctMeta.ctmUpdate
      : new Date(0);

    // send batched requests to get transaction history for addresses
    const mappedTxs = await _getTxsForChunksOfAddresses(addresses, groupOfAddresses => (
      _updateAdaTxsHistoryForGroupOfAddresses([], groupOfAddresses, dateFrom, addresses)
    ));

    // save transactions in lovefieldDB
    return saveTxs(mappedTxs);
  } catch (error) {
    Logger.error('adaTransactionsHistory::updateAdaTxsHistory error: ' + stringifyError(error));
    throw new UpdateAdaTxsHistoryError();
  }
}

/** Split API call on list of addresses into batched requests */
async function _getTxsForChunksOfAddresses(
  addresses: Array<string>,
  apiCall: (Array<string>) => Promise<Array<AdaTransaction>>
): Promise<Array<AdaTransaction>> {
  const groupsOfAddresses = _.chunk(addresses, addressesLimit);
  const groupedTxsPromises = groupsOfAddresses.map(apiCall);
  const groupedTxs = await Promise.all(groupedTxsPromises);
  return groupedTxs.reduce((accum, chunkTxs) => accum.concat(chunkTxs), []);
}

/** Recursively fetch transaction history for a set of addresses from backend API
  * At the same time, update best block saved in local storage
*/
async function _updateAdaTxsHistoryForGroupOfAddresses(
  previousTxs: Array<AdaTransaction>,
  groupOfAddresses: Array<string>,
  dateFrom: Date,
  allAddresses: Array<string>
): Promise<Array<AdaTransaction>> {
  /* We want to get the transaction history of a list of addresses
   * Howevever, the backend API has a limited size in its response
   * Therefore we keep calling it repeatedly until we get the full history.
  */

  // Move cutoff date forward to make progress on recursive calls
  const updatedDateFrom = previousTxs.length > 0
    ? previousTxs[previousTxs.length - 1].ctMeta.ctmUpdate
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
  const transactions = previousTxs.concat(
    _mapToAdaTxs(history, allAddresses)
  );

  // If we reached the API limit, call API again to get more results
  if (history.length === transactionsLimit) {
    return await _updateAdaTxsHistoryForGroupOfAddresses(
      transactions,
      groupOfAddresses,
      dateFrom,
      allAddresses
    );
  }

  return transactions;
}

/** Map database format for historic transactions to actual AdaTransaction format */
function _mapToAdaTxs(
  txs: Array<Transaction>,
  accountAddresses: Array<string>
): Array<AdaTransaction> {
  return txs.map(tx => {
    const inputs = _mapInputOutput(tx.inputs_address, tx.inputs_amount);
    const outputs = _mapInputOutput(tx.outputs_address, tx.outputs_amount);
    const { isOutgoing, amount } = _spenderData(inputs, outputs, accountAddresses);
    const time = tx.time;
    return toAdaTx(amount, tx, inputs, isOutgoing, outputs, time);
  });
}

/** Map database format for historic transactions to AdaTransactionInputOutput format */
function _mapInputOutput(
  addresses: Array<string>,
  amounts: Array<string>
): Array<AdaTransactionInputOutput> {
  return addresses.map((address, index) => [address, { getCCoin: amounts[index] }]);
}

/** Calculate whether transaction is ingoing/outgoing and how was sent out */
function _spenderData(
  txInputs: Array<AdaTransactionInputOutput>,
  txOutputs: Array<AdaTransactionInputOutput>,
  addresses: Array<string>
): {
  isOutgoing: boolean,
  amount: BigNumber
} {
  // Utility func to sum & count up all inputs (or outputs) of a transaction that belong to user
  const sum = toSum => (
    toSum.reduce(
      ({ totalAmount, count }, [address, { getCCoin }]) => {
        // if it doesn't belong to the user, just skip
        if (addresses.indexOf(address) < 0) return { totalAmount, count };

        return {
          totalAmount: totalAmount.plus(new BigNumber(getCCoin)),
          count: count + 1
        };
      },
      {
        totalAmount: new BigNumber(0),
        count: 0
      }
    )
  );

  const incoming = sum(txOutputs);
  const outgoing = sum(txInputs);

  const isOutgoing = outgoing.totalAmount.greaterThanOrEqualTo(
    incoming.totalAmount
  );

  // Note: this also counts redemption transactions as self transactions
  const isSelfTransaction =
    incoming.count === txInputs.length &&
    outgoing.count === txOutputs.length;

  let amount; // represents how much sender sent out
  if (isOutgoing || isSelfTransaction) amount = outgoing.totalAmount.minus(incoming.totalAmount);
  else amount = incoming.totalAmount.minus(outgoing.totalAmount);

  return {
    isOutgoing,
    amount
  };
}
