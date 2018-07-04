import lf from 'lovefield';
import BigNumber from 'bignumber.js';

const txsTableName = 'Txs';
const txsTableFields = {
  CT_AMOUNT: 'ctAmount',
  CT_BLOCK_NUMBER: 'ctBlockNumber',
  CT_ID: 'ctId',
  CT_INPUTS: 'ctInputs',
  CT_IS_OUTGOING: 'ctIsOutgoing',
  CT_META: 'ctMeta',
  CTM_DATE: 'ctmDate',
  CT_OUTPUTS: 'ctOutputs',
  CT_CONDITION: 'ctCondition'
};
const orders = {
  ASC: lf.Order.ASC,
  DESC: lf.Order.DESC
};

const LovefieldDB = {
  db: null,
  txsTableName,
  txsTableFields,
  orders
};

export default LovefieldDB;

// Ensure we are only creating a single instance of the lovefield database
/* TODO: Create only one column of type Object to save the whole Tx. Only
  ctId and ctmDate should be in separate columns */
export const loadLovefieldDB = async() => {
  if (LovefieldDB.db) {
    return Promise.resolve(LovefieldDB.db);
  }
  const schemaBuilder = lf.schema.create('icarus-schema', 1);
  schemaBuilder.createTable(LovefieldDB.txsTableName)
    .addColumn(txsTableFields.CT_AMOUNT, lf.Type.OBJECT)
    .addColumn(txsTableFields.CT_BLOCK_NUMBER, lf.Type.STRING)
    .addColumn(txsTableFields.CT_ID, lf.Type.STRING)
    .addColumn(txsTableFields.CT_INPUTS, lf.Type.OBJECT)
    .addColumn(txsTableFields.CT_IS_OUTGOING, lf.Type.BOOLEAN)
    .addColumn(txsTableFields.CT_META, lf.Type.OBJECT)
    .addColumn(txsTableFields.CTM_DATE, lf.Type.DATE_TIME)
    .addColumn(txsTableFields.CT_OUTPUTS, lf.Type.OBJECT)
    .addColumn(txsTableFields.CT_CONDITION, lf.Type.STRING)
    .addPrimaryKey([txsTableFields.CT_ID])
    .addIndex('idxCtmDate', [txsTableFields.CTM_DATE], false, LovefieldDB.orders.DESC);
  return await schemaBuilder.connect().then(db => {
    LovefieldDB.db = db;
    return db;
  });
};

export const insertOrReplaceToTxsTable = function (rows) {
  return LovefieldDB.db.insertOrReplace()
  .into(_getTxsTable())
  .values(rows)
  .exec()
  .catch(err => err);
};

export const getTxWithDBSchema = function (amount, tx, inputs, isOutgoing, outputs, time) {
  const isPending = !tx.block_num;
  return {
    [LovefieldDB.txsTableFields.CT_AMOUNT]: {
      getCCoin: amount.toString()
    },
    [LovefieldDB.txsTableFields.CT_BLOCK_NUMBER]: tx.block_num || '',
    [LovefieldDB.txsTableFields.CT_ID]: tx.hash,
    [LovefieldDB.txsTableFields.CT_INPUTS]: { newInputs: inputs },
    [LovefieldDB.txsTableFields.CT_IS_OUTGOING]: isOutgoing,
    [LovefieldDB.txsTableFields.CT_META]: {
      ctmDate: time,
      ctmDescription: undefined,
      ctmTitle: undefined
    },
    [LovefieldDB.txsTableFields.CTM_DATE]: new Date(time),
    [LovefieldDB.txsTableFields.CT_OUTPUTS]: { newOutputs: outputs },
    [LovefieldDB.txsTableFields.CT_CONDITION]: isPending ? 'CPtxApplying' : 'CPtxInBlocks'
  };
};

export const getDBRow = function (newtx) {
  return _getTxsTable().createRow(newtx);
};

export const getMostRecentTxFromRows = function (previousTxsRows) {
  const previousTxsRowsLth = previousTxsRows.length;
  return previousTxsRows[previousTxsRowsLth - 1] ?
    previousTxsRows[previousTxsRowsLth - 1].m :
    previousTxsRows[previousTxsRowsLth - 1];
};

export const getConfirmedTxsFromDB = async function () {
  const txsTable = _getTxsTable();
  const rows = await LovefieldDB.db.select()
    .from(txsTable)
    .where(txsTable[LovefieldDB.txsTableFields.CT_CONDITION].eq('CPtxInBlocks'))
    .orderBy(txsTable[LovefieldDB.txsTableFields.CTM_DATE], LovefieldDB.orders.DESC)
    .exec();
  return _mapRowsToTxs(rows);
};

export const getAllTxsFromTxsTable = async function () {
  const txsTable = _getTxsTable();
  const rows = await LovefieldDB.db.select()
    .from(txsTable)
    .orderBy(txsTable[LovefieldDB.txsTableFields.CTM_DATE], LovefieldDB.orders.DESC)
    .exec();
  return _mapRowsToTxs(rows);
};

export const updatePendingTxs = async function (pendingTxs) {
  await _deletePendingTxs();
  await insertOrReplaceToTxsTable(pendingTxs);
};

const _mapRowsToTxs = function (rows) {
  return rows.map(txDB => {
    const newTx = Object.assign({}, txDB);
    newTx.ctInputs = txDB.ctInputs.newInputs.map(address => (address[0] ? address : [address]));
    newTx.ctOutputs = txDB.ctOutputs.newOutputs.map(address => (address[0] ? address : [address]));
    newTx.ctAmount = Object.assign({}, newTx.ctAmount);
    newTx.ctAmount.getCCoin = new BigNumber(txDB.ctAmount.getCCoin);
    return newTx;
  });
};

const _deletePendingTxs = async function () {
  const txsTable = _getTxsTable();
  return LovefieldDB.db.delete()
    .from(txsTable)
    .where(txsTable[LovefieldDB.txsTableFields.CT_CONDITION].eq('CPtxApplying'))
    .exec();
};

const _getTxsTable = function () {
  return LovefieldDB.db.getSchema().table(LovefieldDB.txsTableName);
};
