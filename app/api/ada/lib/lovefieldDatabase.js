import lf, { Type } from 'lovefield';

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
    id: 'id',
    date: 'date',
    value: 'value',
    state: 'state',
    lastUpdated: 'lastUpdated'
  }
};

const txAddressesTableSchema = {
  name: 'TxAddresses',
  properties: {
    id: 'id',
    address: 'address',
    tx: 'tx'
  }
};

let db;

// Ensure we are only creating a single instance of the lovefield database
export const loadLovefieldDB = () => {
  if (db) return Promise.resolve(db);

  const schemaBuilder = lf.schema.create('icarus-schema', 1);

  schemaBuilder.createTable(txsTableSchema.name)
    .addColumn(txsTableSchema.properties.id, Type.STRING)
    .addColumn(txsTableSchema.properties.state, Type.STRING)
    .addColumn(txsTableSchema.properties.date, Type.DATE_TIME)
    .addColumn(txsTableSchema.properties.lastUpdated, Type.DATE_TIME)
    .addColumn(txsTableSchema.properties.value, Type.OBJECT)
    .addPrimaryKey([txsTableSchema.properties.id])
    .addIndex('idxDate', [txsTableSchema.properties.date], false, lf.Order.DESC);

  schemaBuilder.createTable(addressesTableSchema.name)
    .addColumn(addressesTableSchema.properties.id, Type.STRING)
    .addColumn(addressesTableSchema.properties.type, Type.STRING)
    .addColumn(addressesTableSchema.properties.value, Type.OBJECT)
    .addPrimaryKey([addressesTableSchema.properties.id]);

  schemaBuilder.createTable(txAddressesTableSchema.name)
    .addColumn(txAddressesTableSchema.properties.id, Type.STRING)
    .addColumn(txAddressesTableSchema.properties.address, Type.STRING)
    .addColumn(txAddressesTableSchema.properties.tx, Type.STRING)
    .addPrimaryKey([txAddressesTableSchema.properties.id])
    .addForeignKey('fkAddress', {
      local: txAddressesTableSchema.properties.address,
      ref: `${addressesTableSchema.name}.${addressesTableSchema.properties.id}`
    })
    .addForeignKey('fkTx', {
      local: txAddressesTableSchema.properties.tx,
      ref: `${txsTableSchema.name}.${txsTableSchema.properties.id}`
    });

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
  const txAddressesTable = _getTxAddressesTable();
  return db.select(
    addressesTable[addressesTableSchema.properties.value],
    // We count the amount of txs the address is part of
    // to avoid checking for null properties in the joined result
    lf.fn.count(txAddressesTable[txAddressesTableSchema.properties.tx]).as('timesUsed')
  )
    .from(addressesTable)
    .leftOuterJoin(
      txAddressesTable,
      addressesTable[addressesTableSchema.properties.id]
        .eq(txAddressesTable[txAddressesTableSchema.properties.address])
    )
    .where(addressesTable[addressesTableSchema.properties.type].eq(addressType))
    .groupBy(addressesTable[addressesTableSchema.properties.id])
    .exec()
    .then(rows => rows.map(row =>
      Object.assign(
        {},
        row[addressesTableSchema.name][addressesTableSchema.properties.value],
        { cadIsUsed: !!row.timesUsed }
      )
    ));
};

export const saveAddresses = async (addresses, type) => {
  const rows = addresses.map(address => _addressToRow(address, type));
  return _insertOrReplaceQuery(rows, _getAddressesTable()).exec();
};

export const saveTxs = async (txs) => {
  const dbTransaction = db.createTransaction();
  const [txRows, txAddressesRowsPromises] =
    txs.reduce(([txRowsAccum, txAddressesRowsAccum], tx) => [
      txRowsAccum.concat(_txToRow(tx)),
      txAddressesRowsAccum.concat(_getTxAddressesRows(tx))
    ], [[], []]);
  const txQuery = _insertOrReplaceQuery(txRows, _getTxsTable());
  const txAddressesRows = await Promise.all(txAddressesRowsPromises);
  const txAddressRows = txAddressesRows.reduce((accum, rows) => accum.concat(rows), []);
  const txAddressesQuery = _insertOrReplaceQuery(txAddressRows, _getTxAddressesTable());
  return dbTransaction.exec([txQuery, txAddressesQuery]);
};

export const getMostRecentTx = function (txs) {
  return txs[txs.length - 1];
};

export const getTxsOrderedByUpdateDesc = function () {
  return _getTxsOrderedBy(txsTableSchema.properties.lastUpdated, lf.Order.DESC);
};

export const getTxsOrderedByDateDesc = function () {
  return _getTxsOrderedBy(txsTableSchema.properties.date, lf.Order.DESC);
};

export const getTxLastUpdatedDate = async () => {
  const table = _getTxsTable();
  const result = await db.select(table[txsTableSchema.properties.lastUpdated])
    .from(table)
    .orderBy(table[txsTableSchema.properties.lastUpdated], lf.Order.DESC)
    .limit(1)
    .exec();
  return result.length === 1 ? result[0].lastUpdated : undefined;
};

export const getPendingTxs = function () {
  const txsTable = _getTxsTable();
  return db.select()
    .from(txsTable)
    .where(txsTable[txsTableSchema.properties.state].eq('CPtxApplying'))
    .exec()
    .then(rows => rows.map(row => row[addressesTableSchema.properties.value]));
};

const _getTxsOrderedBy = (orderField, lfOrder) => {
  const txsTable = _getTxsTable();
  return db.select()
    .from(txsTable)
    .orderBy(txsTable[orderField], lfOrder)
    .exec()
    .then(rows => rows.map(row => row[txsTableSchema.properties.value]));
};

const _getTxAddressesRows = async (tx) => {
  const txOutputs = tx.ctOutputs.map(([outputAddress]) => outputAddress);
  const txAddresses = await _getAddressesIn(txOutputs);
  const txAddressesTable = _getTxAddressesTable();
  return txAddresses.map(address => txAddressesTable.createRow({
    id: address.concat(tx.ctId),
    address,
    tx: tx.ctId
  }));
};

const _getAddressesIn = (addresses) => {
  const addressesTable = _getAddressesTable();
  return db.select()
    .from(addressesTable)
    .where(addressesTable[addressesTableSchema.properties.id].in(addresses))
    .exec()
    .then(rows => rows.map(row => row[addressesTableSchema.properties.id]));
};

const _txToRow = (tx) =>
  _getTxsTable().createRow({
    id: tx.ctId,
    date: tx.ctMeta.ctmDate,
    value: tx,
    state: tx.ctCondition,
    lastUpdated: tx.ctMeta.ctmUpdate
  });

const _addressToRow = (address, type) =>
  _getAddressesTable().createRow({
    id: address.cadId,
    type,
    value: address,
    isUsed: address.cadIsUsed
  });

const _insertOrReplaceQuery = (rows, table) =>
  db.insertOrReplace().into(table).values(rows);

const _getTable = (name) => db.getSchema().table(name);

const _getTxsTable = () => _getTable(txsTableSchema.name);

const _getAddressesTable = () => _getTable(addressesTableSchema.name);

const _getTxAddressesTable = () => _getTable(txAddressesTableSchema.name);
