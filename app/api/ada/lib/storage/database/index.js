// @flow

import { getInitialSeeds } from './initialSeed';
import {
  schema,
} from 'lovefield';
import type {
  lf$Database,
  lf$raw$BackStore,
} from 'lovefield';
import {
  getAllSchemaTables,
  raii,
} from './utils';
import { GetEncryptionMeta, } from './primitives/api/read';
import { ModifyEncryptionMeta, } from './primitives/api/write';

import { populatePrimitivesDb } from './primitives/tables';
import { populateBip44Db } from './bip44/tables';
import { populateUtxoTransactionsDb } from './utxoTransactions/tables';
import { populateAccountingTransactionsDb } from './accountingTransactions/tables';
import { populateWalletDb } from './wallet/tables';

export const loadLovefieldDB = async (
  storeType: $Values<typeof schema.DataStoreType>
): Promise<lf$Database> => {
  const db = await populateAndCreate(storeType);

  const deps = Object.freeze({
    GetEncryptionMeta,
    ModifyEncryptionMeta,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  await raii(
    db,
    depTables,
    async tx => {
      const hasMeta = await deps.GetEncryptionMeta.exists(
        db, tx,
      );
      if (!hasMeta) {
        const { AddressSeed, TransactionSeed, BlockSeed } = getInitialSeeds();
        await deps.ModifyEncryptionMeta.setInitial(
          db, tx,
          {
            EncryptionMetaId: 0,
            AddressSeed,
            TransactionSeed,
            BlockSeed,
          }
        );
      }
    }
  );

  return db;
};

const populateAndCreate = async (
  storeType: $Values<typeof schema.DataStoreType>
): Promise<lf$Database> => {
  const schemaBuilder = schema.create('yoroi-schema', 2);

  populatePrimitivesDb(schemaBuilder);
  populateWalletDb(schemaBuilder);
  populateBip44Db(schemaBuilder);
  populateUtxoTransactionsDb(schemaBuilder);
  populateAccountingTransactionsDb(schemaBuilder);

  return await schemaBuilder.connect({
    storeType,
    onUpgrade,
  });
};

export async function clear(
  db: lf$Database,
): Promise<void> {
  const tx = db.createTransaction();
  await tx.begin(db.getSchema().tables());

  for (const table of db.getSchema().tables()) {
    await tx.attach(db.delete().from(table));
  }
  await tx.commit();
}

/**
 * expose dump of previous DB version so we can use it for migration
 * Note: all connection types reuse this variable unfortunately
 * since there is no way to detect the database type given just the raw back store
 */
export const dumpByVersion: { [tableName: string]: Array<any> } = {};

async function onUpgrade(
  rawDb: lf$raw$BackStore,
): Promise<void> {
  const version = rawDb.getVersion();
  if (version === 0) {
    // defaults to 0 when first time launching ever
    return;
  }
  const dump = await rawDb.dump();
  if (version === 1) {
    Object.assign(dumpByVersion, dump);
    await rawDb.dropTable('TxAddresses');
    await rawDb.dropTable('Txs');
    await rawDb.dropTable('Addresses');
  } else {
    throw new Error('unexpected version number');
  }
}
