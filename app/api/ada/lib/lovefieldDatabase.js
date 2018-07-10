import lf from 'lovefield';

const addressesTableSchema = {
  name: 'Addresses',
  properties: {
    id: 'id',
    type: 'type',
    value: 'value',
    isUsed: 'isUsed'
  }
};

const txsTableSchema = {
  name: 'Txs',
  properties: {
    id: 'id',
    date: 'date',
    value: 'value',
    isPending: 'isPending'
  }
};

let db;

// Ensure we are only creating a single instance of the lovefield database
export const loadLovefieldDB = () => {
  if (db) return Promise.resolve(db);

  const schemaBuilder = lf.schema.create('icarus-schema', 1);

  schemaBuilder.createTable(txsTableSchema.name)
    .addColumn(txsTableSchema.properties.id, lf.Type.STRING)
    .addColumn(txsTableSchema.properties.date, lf.Type.STRING)
    .addColumn(txsTableSchema.properties.value, lf.Type.OBJECT)
    .addColumn(txsTableSchema.properties.isPending, lf.Type.BOOLEAN)
    .addPrimaryKey([txsTableSchema.properties.id])
    .addIndex('idxDate', [txsTableSchema.properties.date], false, lf.Order.DESC);

  schemaBuilder.createTable(addressesTableSchema.name)
    .addColumn(addressesTableSchema.properties.id, lf.Type.STRING)
    .addColumn(addressesTableSchema.properties.type, lf.Type.STRING)
    .addColumn(addressesTableSchema.properties.value, lf.Type.OBJECT)
    .addColumn(addressesTableSchema.properties.isUsed, lf.Type.BOOLEAN)
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

export const getUnusedExternalAddresses = () => {
  const addressesTable = _getAddressesTable();
  return db.select()
    .from(addressesTable)
    .where(lf.op.and(
      addressesTable[addressesTableSchema.properties.isUsed].eq(false),
      addressesTable[addressesTableSchema.properties.type].eq('External')
    ))
    .exec()
    .then(rows => rows.map(row => row[addressesTableSchema.properties.value]));
};

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
  return _insertOrReplace(rows, _getAddressesTable());
};

export const saveTxs = (txs) => {
  const rows = txs.map(tx => _txToRow(tx));
  _insertOrReplace(rows, _getTxsTable());
};

export const getMostRecentTx = function (txs) {
  return txs[txs.length - 1];
};

export const getConfirmedTxs = function () {
  const txsTable = _getTxsTable();
  return db.select()
    .from(txsTable)
    .where(txsTable[txsTableSchema.properties.isPending].eq(false))
    .orderBy(txsTable[txsTableSchema.properties.date], lf.Order.DESC)
    .exec()
    .then(rows => rows.map(row => row[txsTableSchema.properties.value]));
};

export const getTxs = async function () {
  const txsTable = _getTxsTable();
  return db.select()
    .from(txsTable)
    .orderBy(txsTable[txsTableSchema.properties.date], lf.Order.DESC)
    .exec()
    .then(rows => rows.map(row => row[txsTableSchema.properties.value]));
};

export const deletePendingTxs = async function () {
  const txsTable = _getTxsTable();
  return db.delete()
    .from(txsTable)
    .where(txsTable[txsTableSchema.properties.isPending].eq(true))
    .exec();
};

const _txToRow = (tx) =>
  _getTxsTable().createRow({
    id: tx.ctId,
    date: tx.ctmDate,
    value: tx,
    isPending: !tx.ctBlockNumber
  });

const _addressToRow = (address, type) =>
  _getAddressesTable().createRow({
    id: address.cadId,
    type,
    value: address,
    isUsed: address.cadIsUsed
  });

const _insertOrReplace = (rows, table) =>
  db.insertOrReplace().into(table).values(rows).exec();

const _getTable = (name) => db.getSchema().table(name);

const _getTxsTable = () => _getTable(txsTableSchema.name);

const _getAddressesTable = () => _getTable(addressesTableSchema.name);
