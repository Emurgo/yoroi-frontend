// @flow
import _ from 'lodash';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import {
  getTransactionsHistoryForAddresses,
  transactionsLimit,
  addressesLimit,
  getPendingTxsForAddresses
} from '../lib/icarus-backend-api';
import {
  insertOrReplaceToTxsTable,
  getDBRow,
  getTxWithDBSchema,
  getMostRecentTxFromRows,
  getAllTxsFromTxsTable,
  updatePendingTxs,
  getConfirmedTxsFromDB
} from '../lib/lovefieldDatabase';
import {
  getLastBlockNumber,
  saveLastBlockNumber
} from '../getAdaLastBlockNumber';
import {
  UpdateAdaTxsHistoryError,
  PendingTransactionError
} from '../errors';
import type
 {
  AdaTransaction,
  AdaTransactions,
  AdaTransactionInputOutput
} from '../adaTypes';

// FIXME: Extract to another file
const Logger = console;
const stringifyError = o => o.toString();

export const getAdaConfirmedTxs = getConfirmedTxsFromDB;

export const getAdaTxsHistoryByWallet = async (): Promise<AdaTransactions> => {
  const transactions = await getAllTxsFromTxsTable();
  return Promise.resolve([transactions, transactions.length]);
};

export async function updateAdaPendingTxs(addresses: Array<string>) {
  try {
    const txs = await _getTxsForChunksOfAddresses(
      addresses,
      getPendingTxsForAddresses
    );
    const mappedPendingTxs = _mapTransactions(txs, addresses);
    return updatePendingTxs(mappedPendingTxs);
  } catch (error) {
    Logger.error('adaTransactionsHistory::updateAdaPendingTxs error: ' + stringifyError(error));
    throw new PendingTransactionError();
  }
}

export async function updateAdaTxsHistory(
  existingTransactions: Array<AdaTransaction>,
  addresses: Array<string>
) {
  try {
    const mostRecentTx = Object.assign({}, existingTransactions[0]);
    const dateFrom = mostRecentTx && mostRecentTx.ctMeta ?
      moment(mostRecentTx.ctMeta.ctmDate) :
      moment(new Date(0));
    const mappedTxs = await _getTxsForChunksOfAddresses(addresses, groupOfAddresses =>
      _updateAdaTxsHistoryForGroupOfAddresses([], groupOfAddresses, dateFrom, addresses)
    );
    return insertOrReplaceToTxsTable(mappedTxs);
  } catch (error) {
    Logger.error('adaTransactionsHistory::updateAdaTxsHistory error: ' + stringifyError(error));
    throw new UpdateAdaTxsHistoryError();
  }
}

async function _getTxsForChunksOfAddresses(addresses, apiCall) {
  const groupsOfAddresses = _.chunk(addresses, addressesLimit);
  const groupedTxsPromises = groupsOfAddresses.map(apiCall);
  const groupedTxs = await Promise.all(groupedTxsPromises);
  return groupedTxs.reduce((accum, chunkTxs) => accum.concat(chunkTxs), []);
}

async function _updateAdaTxsHistoryForGroupOfAddresses(
  previousTxsRows,
  groupOfAddresses,
  dateFrom,
  allAddresses
) {
  const mostRecentTx = getMostRecentTxFromRows(previousTxsRows);
  const updatedDateFrom = mostRecentTx ? moment(mostRecentTx.ctMeta.ctmDate) : dateFrom;
  const txHash = mostRecentTx ? mostRecentTx.ctId : mostRecentTx;
  const history = await getTransactionsHistoryForAddresses(
    groupOfAddresses,
    updatedDateFrom,
    txHash
  );
  if (history.length > 0) {
    const transactionsRows = previousTxsRows.concat(
      _mapTransactions(history, allAddresses));
    if (history.length === transactionsLimit) {
      return await _updateAdaTxsHistoryForGroupOfAddresses(
        transactionsRows,
        groupOfAddresses,
        dateFrom,
        allAddresses
      );
    }
    return Promise.resolve(transactionsRows);
  }
  return Promise.resolve(previousTxsRows);
}

function _mapTransactions(
  transactions: [],
  accountAddresses
): Array<AdaTransaction> {
  return transactions.map(tx => {
    const inputs = _mapInputOutput(tx.inputs_address, tx.inputs_amount);
    const outputs = _mapInputOutput(tx.outputs_address, tx.outputs_amount);
    const { isOutgoing, amount } = _spenderData(inputs, outputs, accountAddresses);
    if (!getLastBlockNumber() || tx.best_block_num > getLastBlockNumber()) {
      saveLastBlockNumber(tx.best_block_num);
    }
    const time = tx.time || tx.created_time;
    const newtx = getTxWithDBSchema(amount, tx, inputs, isOutgoing, outputs, time);
    return getDBRow(newtx);
  });
}

function _mapInputOutput(addresses, amounts): AdaTransactionInputOutput {
  return addresses.map((address, index) => [address, { getCCoin: amounts[index] }]);
}

function _spenderData(txInputs, txOutputs, addresses) {
  const sum = toSum =>
    toSum.reduce(
      ({ totalAmount, count }, [address, { getCCoin }]) => {
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
    );

  const incoming = sum(txOutputs);
  const outgoing = sum(txInputs);

  const isOutgoing = outgoing.totalAmount.greaterThanOrEqualTo(
    incoming.totalAmount
  );

  const isLocal =
    incoming.count === txInputs.length &&
    outgoing.count === txOutputs.length;

  let amount;
  if (isLocal) amount = outgoing.totalAmount;
  else if (isOutgoing) amount = outgoing.totalAmount.minus(incoming.totalAmount);
  else amount = incoming.totalAmount.minus(outgoing.totalAmount);

  return {
    isOutgoing,
    amount
  };
}
