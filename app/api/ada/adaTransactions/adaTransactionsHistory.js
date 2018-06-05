// @flow
import _ from 'lodash';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import {
  getTransactionsHistoryForAddresses,
  transactionsLimit,
  addressesLimit
} from '../lib/icarus-backend-api';
import LovefieldDB from '../lib/lovefieldDatabase';
import {
  getLastBlockNumber,
  saveLastBlockNumber
} from '../getAdaLastBlockNumber';
import { getAdaTransactions } from './adaTransactions';

export const getAdaTxsHistoryByWallet = async (): Promise<AdaTransactions> => {
  const transactions = await getAdaTransactions();
  return Promise.resolve([transactions, transactions.length]);
};

export async function updateAdaTxsHistory(
  existedTransactions: Array<AdaTransaction>,
  addresses: Array<string>
) {
  const db = LovefieldDB.db;
  const txsTable = db.getSchema().table('Txs');
  const mostRecentTx = db.select()
    .from(txsTable)
    .limit(1)
    .orderBy(txsTable[LovefieldDB.txsTableFields.CTM_DATE], LovefieldDB.orders.DESC)
    .exec();
  const dateFrom = mostRecentTx && mostRecentTx.ctMeta ?
    moment(mostRecentTx.ctMeta.ctmDate) :
    moment(new Date(0));
  const groupsOfAddresses = _.chunk(addresses, addressesLimit);
  const promises = groupsOfAddresses.map(groupOfAddresses =>
    _updateAdaTxsHistoryForGroupOfAddresses([], groupOfAddresses, dateFrom, addresses, txsTable)
  );
  return Promise.all(promises)
    .then((groupsOfTransactionsRows) =>
      groupsOfTransactionsRows.map(groupOfTransactionsRows =>
        db.insertOrReplace()
        .into(txsTable)
        .values(groupOfTransactionsRows)
        .exec()
        .catch(err => err)
      )
    );
}

async function _updateAdaTxsHistoryForGroupOfAddresses(
  previousTxsRows,
  groupOfAddresses,
  dateFrom,
  allAddresses,
  txsTable
) {
  const previousTxsRowsLth = previousTxsRows.length;
  const mostRecentTx = previousTxsRows[previousTxsRowsLth - 1] ?
    previousTxsRows[previousTxsRowsLth - 1].m :
    previousTxsRows[previousTxsRowsLth - 1];
  const updatedDateFrom = mostRecentTx ? moment(mostRecentTx.ctMeta.ctmDate) : dateFrom;
  const history = await getTransactionsHistoryForAddresses(groupOfAddresses, updatedDateFrom);
  if (history.length > 0) {
    const transactionsRows = previousTxsRows.concat(
      _mapTransactions(history, allAddresses, txsTable));
    if (history.length === transactionsLimit) {
      return await _updateAdaTxsHistoryForGroupOfAddresses(
        transactionsRows,
        groupOfAddresses,
        dateFrom,
        allAddresses,
        txsTable
      );
    }
    return Promise.resolve(transactionsRows);
  }
  return Promise.resolve(previousTxsRows);
}

function _mapTransactions(
  transactions: [],
  accountAddresses,
  txsTable
): Array<AdaTransaction> {
  return transactions.map(tx => {
    const inputs = _mapInputOutput(tx.inputs_address, tx.inputs_amount);
    const outputs = _mapInputOutput(tx.outputs_address, tx.outputs_amount);
    const { isOutgoing, amount } = _spenderData(inputs, outputs, accountAddresses);
    const isPending = tx.block_num === null;
    if (!getLastBlockNumber() || tx.best_block_num > getLastBlockNumber()) {
      saveLastBlockNumber(tx.best_block_num);
    }
    const newtx = {
      [LovefieldDB.txsTableFields.CT_AMOUNT]: {
        getCCoin: amount
      },
      [LovefieldDB.txsTableFields.CT_BLOCK_NUMBER]: tx.block_num,
      [LovefieldDB.txsTableFields.CT_ID]: tx.hash,
      [LovefieldDB.txsTableFields.CT_INPUTS]: { newInputs: inputs },
      [LovefieldDB.txsTableFields.CT_IS_OUTGOING]: isOutgoing,
      [LovefieldDB.txsTableFields.CT_META]: {
        ctmDate: tx.time,
        ctmDescription: undefined,
        ctmTitle: undefined
      },
      [LovefieldDB.txsTableFields.CTM_DATE]: new Date(tx.time),
      [LovefieldDB.txsTableFields.CT_OUTPUTS]: { newOutputs: outputs },
      [LovefieldDB.txsTableFields.CT_CONDITION]: isPending ? 'CPtxApplying' : 'CPtxInBlocks'
    };
    return txsTable.createRow(newtx);
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
  else if (isOutgoing) amount = outgoing.totalAmount - incoming.totalAmount;
  else amount = incoming.totalAmount - outgoing.totalAmount;

  return {
    isOutgoing,
    amount
  };
}
