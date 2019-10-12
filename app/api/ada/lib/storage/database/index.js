// @flow

import crypto from 'crypto';
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
import { GetEncryptionMeta, } from './uncategorized/api/read';
import { ModifyEncryptionMeta, } from './uncategorized/api/write';

import { populateUncategorizedDb } from './uncategorized/tables';
import { populateBip44Db } from './bip44/tables';
import { populateTransactionsDb } from './transactions/tables';
import { populateWalletDb } from './wallet/tables';
import environment from '../../../../../environment';

export const loadLovefieldDB = async (
  storeType: $Values<typeof schema.DataStoreType>
): Promise<lf$Database> => {
  const db = await populateAndCreate(storeType);

  await raii(
    db,
    [
      ...getAllSchemaTables(db, GetEncryptionMeta),
      ...getAllSchemaTables(db, ModifyEncryptionMeta),
    ],
    async tx => {
      const hasMeta = await GetEncryptionMeta.exists(
        db, tx,
      );
      if (!hasMeta) {
        await ModifyEncryptionMeta.setInitial(
          db, tx,
          {
            EncryptionMetaId: 0,
            AddressSeed: environment.isJest()
              ? 1690513609
              : crypto.randomBytes(4).readUInt32BE(0),
            TransactionSeed: environment.isJest()
              ? 769388545
              : crypto.randomBytes(4).readUInt32BE(0),
            BlockSeed: environment.isJest()
              ? 371536492
              : crypto.randomBytes(4).readUInt32BE(0),
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

  populateUncategorizedDb(schemaBuilder);
  populateBip44Db(schemaBuilder);
  populateTransactionsDb(schemaBuilder);
  populateWalletDb(schemaBuilder);

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
