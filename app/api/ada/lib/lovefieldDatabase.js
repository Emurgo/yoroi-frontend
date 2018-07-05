import lf from 'lovefield';
import BigNumber from 'bignumber.js';

const addressesTableSchema = {
  name: 'Addresses',
  properties: {
    id: 'id',
    type: 'type',
    value: 'value'
  }
};

const txsTableSchema = {
  name: 'Txs',
  properties: {
    CT_AMOUNT: 'ctAmount',
    CT_BLOCK_NUMBER: 'ctBlockNumber',
    CT_ID: 'ctId',
    CT_INPUTS: 'ctInputs',
    CT_IS_OUTGOING: 'ctIsOutgoing',
    CT_META: 'ctMeta',
    CTM_DATE: 'ctmDate',
    CT_OUTPUTS: 'ctOutputs',
    CT_CONDITION: 'ctCondition'
  }
};

let db;

// Ensure we are only creating a single instance of the lovefield database
/* TODO: Create only one column of type Object to save the whole Tx. Only
  ctId and ctmDate should be in separate columns */
export const loadLovefieldDB = () => {
  if (db) return Promise.resolve(db);

  const schemaBuilder = lf.schema.create('icarus-schema', 1);

  schemaBuilder.createTable(txsTableSchema.name)
    .addColumn(txsTableSchema.properties.CT_AMOUNT, lf.Type.OBJECT)
    .addColumn(txsTableSchema.properties.CT_BLOCK_NUMBER, lf.Type.STRING)
    .addColumn(txsTableSchema.properties.CT_ID, lf.Type.STRING)
    .addColumn(txsTableSchema.properties.CT_INPUTS, lf.Type.OBJECT)
    .addColumn(txsTableSchema.properties.CT_IS_OUTGOING, lf.Type.BOOLEAN)
    .addColumn(txsTableSchema.properties.CT_META, lf.Type.OBJECT)
    .addColumn(txsTableSchema.properties.CTM_DATE, lf.Type.DATE_TIME)
    .addColumn(txsTableSchema.properties.CT_OUTPUTS, lf.Type.OBJECT)
    .addColumn(txsTableSchema.properties.CT_CONDITION, lf.Type.STRING)
    .addPrimaryKey([txsTableSchema.properties.CT_ID])
    .addIndex('idxCtmDate', [txsTableSchema.properties.CTM_DATE], false, lf.Order.DESC);

  schemaBuilder.createTable(addressesTableSchema.name)
    .addColumn(addressesTableSchema.properties.id, lf.Type.STRING)
    .addColumn(addressesTableSchema.properties.type, lf.Type.STRING)
    .addColumn(addressesTableSchema.properties.value, lf.Type.OBJECT)
    .addPrimaryKey([addressesTableSchema.properties.id]);

  return schemaBuilder.connect().then(newDb => {
    db = newDb;
    return db;
  });
};

export const deleteAddress = (address) => {
  const table = _getAddressesTable();
  db.delete()
    .from(table)
    .where(table[addressesTableSchema.properties.id].eq(address))
    .exec();
};

export const getAddresses = () => db.select().from(_getAddressesTable()).exec();

export const getAddressesList = () => {
  const addressesTable = _getAddressesTable();
  return db.select()
    .from(addressesTable)
    .exec()
    .then(rows => rows.map(row => row[addressesTableSchema.properties.value]));
};

export const getAddressesListByType = addressType => {
  const addressesTable = _getAddressesTable();
  return db.select()
    .from(addressesTable)
    .where(addressesTable[addressesTableSchema.properties.type].eq(addressType))
    .exec()
    .then(rows => rows.map(row => row[addressesTableSchema.properties.value]));
};

export const saveAddresses = (addresses, type) => {
  const rows = addresses.map(address => _addressToRow(address, type));
  _insertOrReplace(rows, _getAddressesTable());
};

const _addressToRow = (address, type) =>
  _getAddressesTable().createRow({
    id: address.cadId,
    type,
    value: address
  });

export const insertOrReplaceToTxsTable = (rows) => _insertOrReplace(rows, _getTxsTable());

export const getTxWithDBSchema = function (amount, tx, inputs, isOutgoing, outputs, time) {
  const isPending = !tx.block_num;
  return {
    [txsTableSchema.properties.CT_AMOUNT]: {
      getCCoin: amount.toString()
    },
    [txsTableSchema.properties.CT_BLOCK_NUMBER]: tx.block_num || '',
    [txsTableSchema.properties.CT_ID]: tx.hash,
    [txsTableSchema.properties.CT_INPUTS]: { newInputs: inputs },
    [txsTableSchema.properties.CT_IS_OUTGOING]: isOutgoing,
    [txsTableSchema.properties.CT_META]: {
      ctmDate: time,
      ctmDescription: undefined,
      ctmTitle: undefined
    },
    [txsTableSchema.properties.CTM_DATE]: new Date(time),
    [txsTableSchema.properties.CT_OUTPUTS]: { newOutputs: outputs },
    [txsTableSchema.properties.CT_CONDITION]: isPending ? 'CPtxApplying' : 'CPtxInBlocks'
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
  const rows = await db.select()
    .from(txsTable)
    .where(txsTable[txsTableSchema.properties.CT_CONDITION].eq('CPtxInBlocks'))
    .orderBy(txsTable[txsTableSchema.properties.CTM_DATE], lf.Order.DESC)
    .exec();
  return _mapRowsToTxs(rows);
};

export const getAllTxsFromTxsTable = async function () {
  const txsTable = _getTxsTable();
  const rows = await db.select()
    .from(txsTable)
    .orderBy(txsTable[txsTableSchema.properties.CTM_DATE], lf.Order.DESC)
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
  return db.delete()
    .from(txsTable)
    .where(txsTable[txsTableSchema.properties.CT_CONDITION].eq('CPtxApplying'))
    .exec();
};

const _insertOrReplace = (rows, table) =>
  db.insertOrReplace().into(table).values(rows).exec();

const _getTable = (name) => db.getSchema().table(name);

const _getTxsTable = () => _getTable(txsTableSchema.name);

const _getAddressesTable = () => _getTable(addressesTableSchema.name);
