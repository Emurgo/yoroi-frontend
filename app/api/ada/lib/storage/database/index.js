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
    tx.attach(db.delete().from(table));
  }
  await tx.commit();
}

async function onUpgrade(
  rawDb: lf$raw$BackStore,
): Promise<void> {
  const version = rawDb.getVersion();
  if (version === 0) {
    // defaults to 0 when first time launching ever
    return;
  }
  if (version === 1) {
    // TODO: expose dump for migration
    const dump = rawDb.dump();

    rawDb.dropTable('TxAddresses');
    rawDb.dropTable('Txs');
    rawDb.dropTable('Addresses');
  } else {
    throw new Error('unexpected version number');
  }
}
