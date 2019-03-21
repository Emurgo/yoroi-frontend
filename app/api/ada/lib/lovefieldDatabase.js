// Client-side database to avoid having to query Yoroi servers when state doesn't change

import lf, { Type } from 'lovefield';
import type {
  AdaTransaction,
  AdaTransactionCondition,
  AddressType
} from '../adaTypes';

// Note: Schemes are inspired (but !=) to schemes used by importer & postgresDB

// Goal: Pair AdaAddress with its AddressType
declare type AddressesTableRow = {
  id: string, // AdaAddress.cadId (hash of address)
  type: AddressType,
  value: AdaAddress
}
const addressesTableSchema = {
  name: 'Addresses',
  properties: {
    id: 'id',
    type: 'type',
    value: 'value'
  }
};

// Goal: Flatten transaction data to easily query as DB table
declare type TxsTableRow = {
  id: string, // AdaTransaction.ctId (hash of transaction)
  date: Date, // AdaTransaction.ctMeta.ctmDate
  value: AdaTransaction,
  state: AdaTransactionCondition, // AdaTransaction.ctCondition
  lastUpdated: Date // AdaTransaction.ctMeta.ctmUpdate
}
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

// Goal: Easily query all transactions an address is used in
declare type TxAddressesTableRow = {
  id: string, // concatenation of address hash + tx hash
  address: string, // AdaAddress.cadId
  tx: string // AdaTransaction.ctId
}
const txAddressesTableSchema = {
  name: 'TxAddresses',
  properties: {
    id: 'id',
    address: 'address',
    tx: 'tx'
  }
};

let db;

/** Ensure we are only creating a single instance of the lovefield database */
export const loadLovefieldDB = () => {
  if (db) return Promise.resolve(db);

  const schemaBuilder = lf.schema.create('yoroi-schema', 1);

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
    // Address must also be part of the AddressesTable
    .addForeignKey('fkAddress', {
      local: txAddressesTableSchema.properties.address,
      ref: `${addressesTableSchema.name}.${addressesTableSchema.properties.id}`
    })
    // Transaction must also be part of the TxsTable
    .addForeignKey('fkTx', {
      local: txAddressesTableSchema.properties.tx,
      ref: `${txsTableSchema.name}.${txsTableSchema.properties.id}`
    });

  return schemaBuilder.connect(
  ).then(newDb => {
    db = newDb;
    return db;
  });
};

export const reset = (): Promise<void> => {
  const txsTable = _getTxsTable();
  const addressesTable = _getAddressesTable();
  const txAddressesTable = _getTxAddressesTable();

  // have to drop txAddresses first because of foreign keys
  db.delete().from(txAddressesTable).exec();
  db.delete().from(addressesTable).exec();
  db.delete().from(txsTable).exec();
};

export const deleteAddress = (
  address: string
): Promise<Array<void>> => {
  const addressesTable = _getAddressesTable();
  return db.delete()
    .from(addressesTable)
    .where(addressesTable[addressesTableSchema.properties.id].eq(address))
    .exec();
};

/** Note: isUsed will be stable on all results */
export const getAddresses = (): Promise<Array<AddressesTableRow>> => {
  const addressesTable = _getAddressesTable();
  return db.select()
    .from(addressesTable)
    .exec();
};

/** Note: isUsed will be stable on all results */
export const getAddressesList = (): Promise<Array<AdaAddress>> => {
  const addressesTable = _getAddressesTable();
  return db.select()
    .from(addressesTable)
    .exec()
    .then(rows => rows.map(row => row[addressesTableSchema.properties.value]));
};

/* Get all AdaAddresses of a certain type with an updated isUsed status */
export const getAddressesListByType = (
  addressType
): Promise<AdaAddresses> => {
  const addressesTable = _getAddressesTable();
  const txAddressesTable = _getTxAddressesTable();
  return db.select(
    addressesTable[addressesTableSchema.properties.value],
    // We count the amount of txs the address is part of
    // to avoid checking for null properties in the joined result
    lf.fn.count(txAddressesTable[txAddressesTableSchema.properties.tx]).as('timesUsed')
  )
    .from(addressesTable)
    // join addresses that have also occurred in transactions
    .leftOuterJoin(
      txAddressesTable,
      addressesTable[addressesTableSchema.properties.id]
        .eq(txAddressesTable[txAddressesTableSchema.properties.address])
    )
    .where(addressesTable[addressesTableSchema.properties.type].eq(addressType))
    .groupBy(addressesTable[addressesTableSchema.properties.id])
    .exec()
    // Note: not good separation of concerns that we use this function to also calculate isUsed
    .then(rows => rows.map(row => Object.assign(
      {},
      row[addressesTableSchema.name][addressesTableSchema.properties.value],
      { cadIsUsed: !!row.timesUsed }
    )));
};

export const saveAddresses = async (
  addresses,
  type
): Promise<Array<AddressesTableRow>> => {
  const rows = addresses.map(address => _addressToRow(address, type));
  return _insertOrReplaceQuery(rows, _getAddressesTable())
    .exec();
};

export const saveTxs = async (
  txs: Array<AdaTransaction>
): Promise<[Array<TxsTableRow>, Array<TxAddressesTableRow>]> => {
  // For every TX we need to update both the TxsTable and TxAddressesTable
  const dbTransaction = db.createTransaction();

  // get row insertions for both tables
  const txsTableInsertRows = txs.map(tx => _txToRow(tx));
  const txAddressesTableInsertRows = txs.map(tx => _getTxAddressesRows(tx));

  // Note: for every tx there are multiple addresses so we have to flatten the map
  const txAddressesRows = await Promise.all(txAddressesTableInsertRows);
  const txAddressRows = txAddressesRows.reduce((accum, rows) => accum.concat(rows), []);

  // create insertion queries
  const txQuery = _insertOrReplaceQuery(txsTableInsertRows, _getTxsTable());
  const txAddressesQuery = _insertOrReplaceQuery(txAddressRows, _getTxAddressesTable());

  return dbTransaction.exec([txQuery, txAddressesQuery]);
};

export const getTxsOrderedByLastUpdateDesc = function (): Promise<Array<AdaTransaction>> {
  return _getTxsOrderedBy(txsTableSchema.properties.lastUpdated, lf.Order.DESC);
};

export const getTxsOrderedByDateDesc = function () : Promise<Array<AdaTransaction>> {
  return _getTxsOrderedBy(txsTableSchema.properties.date, lf.Order.DESC);
};

/** Get date of most recent update or return the start of epoch time if no txs exist. */
export const getTxsLastUpdatedDate = async (): Date => {
  const table = _getTxsTable();
  const result = await db.select(table[txsTableSchema.properties.lastUpdated])
    .from(table)
    .orderBy(table[txsTableSchema.properties.lastUpdated], lf.Order.DESC)
    .limit(1)
    .exec();
  return result.length === 1
    ? result[0].lastUpdated
    : new Date(0);
};

export const getPendingTxs = function (): Promise<Array<AdaTransaction>> {
  const pendingCondition: AdaTransactionCondition = 'CPtxApplying';

  const txsTable = _getTxsTable();
  return db.select()
    .from(txsTable)
    .where(txsTable[txsTableSchema.properties.state].eq(pendingCondition))
    .exec()
    .then(rows => rows.map(row => row[txsTableSchema.properties.value]));
};

/** Helper function to order TxsTable by an arbitrary field */
const _getTxsOrderedBy = (
  orderField,
  lfOrder
): Promise<Array<AdaTransaction>> => {
  const txsTable = _getTxsTable();
  return db.select()
    .from(txsTable)
    .orderBy(txsTable[orderField], lfOrder)
    .exec()
    .then(rows => rows.map(row => row[txsTableSchema.properties.value]));
};

/** Create a list of rows that can be then added to the TxAddressesTable */
const _getTxAddressesRows = async (
  tx: AdaTransaction
) => {
  // Get all outputs addresses in a transaction
  const txOutputs: Array<string> = tx.ctOutputs.map(([outputAddress]) => outputAddress);
  // Find which of those addresses belongs to the user
  const txAddresses: Array<string> = await _getAddressesIn(txOutputs);

  return txAddresses.map(address => {
    const newRow: TxAddressesTableRow = {
      id: address.concat(tx.ctId),
      address,
      tx: tx.ctId
    };
    return _getTxAddressesTable().createRow(newRow);
  });
};

/** Filter a list of addresses to the ones in our Address table */
const _getAddressesIn = (
  addresses: Array<string>
): Promise<Array<string>> => {
  const addressesTable = _getAddressesTable();
  return db.select()
    .from(addressesTable)
    .where(addressesTable[addressesTableSchema.properties.id].in(addresses))
    .exec()
    .then(rows => rows.map(row => row[addressesTableSchema.properties.id]));
};

/** Create a row containing an transaction that can be then added to the TxsTable */
const _txToRow = (
  tx: AdaTransaction
) => {
  const newRow: TxsTableRow =
  {
    id: tx.ctId,
    date: tx.ctMeta.ctmDate,
    value: tx,
    state: tx.ctCondition,
    lastUpdated: tx.ctMeta.ctmUpdate
  };
  return _getTxsTable().createRow(newRow);
};

/** Create a row containing an address that can be then added to the AddressesTable */
const _addressToRow = (
  address: AdaAddress,
  type: AddressType
) => {
  const newRow: AddressesTableRow =
  {
    id: address.cadId,
    type,
    value: address,
  };
  return _getAddressesTable().createRow(newRow);
};

/* Helper functions */

const _insertOrReplaceQuery = (rows: Array<any>, table) => (
  db.insertOrReplace().into(table).values(rows)
);

const _getTable = (name) => db.getSchema().table(name);

const _getTxsTable = () => _getTable(txsTableSchema.name);

const _getAddressesTable = () => _getTable(addressesTableSchema.name);

const _getTxAddressesTable = () => _getTable(txAddressesTableSchema.name);
