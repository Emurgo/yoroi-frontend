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
import { populateCommonDb } from './walletTypes/common/tables';
import { populateBip44Db } from './walletTypes/bip44/tables';
import { populateCip1852Db } from './walletTypes/cip1852/tables';
import { populateUtxoTransactionsDb } from './transactionModels/utxo/tables';
import { populateAccountingTransactionsDb } from './transactionModels/account/tables';
import { populateMultipartTransactionsDb } from './transactionModels/multipart/tables';
import { populateWalletDb } from './walletTypes/core/tables';
import { populateMemoTransactionsDb } from './memos/tables';
import { populatePricesDb } from './prices/tables';

declare var indexedDB;

const deleteDb = () => new Promise(resolve => {
  const deleteRequest = indexedDB.deleteDatabase('yoroi-schema');
  deleteRequest.onsuccess = () => resolve();
  deleteRequest.onerror = () => resolve();
});

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
  const schemaBuilder = schema.create('yoroi-schema', 7);

  populatePrimitivesDb(schemaBuilder);
  populateWalletDb(schemaBuilder);
  populateCommonDb(schemaBuilder);
  populateBip44Db(schemaBuilder);
  populateCip1852Db(schemaBuilder);
  populateUtxoTransactionsDb(schemaBuilder);
  populateAccountingTransactionsDb(schemaBuilder);
  populateMultipartTransactionsDb(schemaBuilder);
  populateMemoTransactionsDb(schemaBuilder);
  populatePricesDb(schemaBuilder);

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
export const dumpByVersion: { [tableName: string]: Array<any>, ... } = {};

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
  } if (version === 2) {
    // if user was in the balance-check version of Yoroi
    // they have an incompatible DB and we don't care about it
    // so we just delete it entirely
    await deleteDb();
    // need to refresh for page to re-create new DB
    window.location.reload();
  } if (version === 3) {
    // In https://github.com/Emurgo/yoroi-frontend/pull/1229
    // I tried to delete balance-check databases but it didn't work

    // only two kinds of people on version 3:
    // 1) People who opened Yoroi after #1229 and are now stuck with the same issue on v3
    // 2) Fresh installs of Yoroi when v3 was most recent

    const numKeys = Object.keys(dump).length;
    // numKeys = 0 means that these are people stuck after #1229 so we clear their db
    // for fresh install users, we don't need to do anything
    if (numKeys === 0) {
      await deleteDb();
      window.location.reload();
    }
  } if (version === 4) {
    // we know that before this version, Yoroi only supported 1 wallet
    // therefore the single wallet always has its root key as derivation id 1
    // and we only launched the new DB for the Shelley testnet
    // so there are only Cip1852 wallets
    await rawDb.addTableColumn(
      'Cip1852Wrapper',
      'RootKeyDerivationId',
      1
    );
  } if (version === 5) {
    // nothing to do. Just adds a new table
  } if (version === 6) {
    // turns out we didn't need this
    await rawDb.dropTableColumn('TxMemo', 'TxMemoId');
  } else {
    throw new Error('unexpected version number');
  }
}
