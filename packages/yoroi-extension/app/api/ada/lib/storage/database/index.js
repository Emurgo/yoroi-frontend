// @flow

import { getInitialSeeds } from './initialSeed';
import {
  schema,
} from 'lovefield';
import type {
  lf$Database,
  lf$raw$BackStore,
  lf$lovefieldExport,
} from 'lovefield';
import {
  getAllSchemaTables,
  raii,
  promisifyDbCall,
} from './utils';
import { GetEncryptionMeta, } from './primitives/api/read';
import { ModifyEncryptionMeta, ModifyNetworks, ModifyToken, } from './primitives/api/write';
import { ModifyExplorers, } from './explorers/api/write';
import { populatePrimitivesDb, TransactionType } from './primitives/tables';
import { populateCommonDb } from './walletTypes/common/tables';
import { populateBip44Db } from './walletTypes/bip44/tables';
import { populateCip1852Db } from './walletTypes/cip1852/tables';
import { populateUtxoTransactionsDb } from './transactionModels/utxo/tables';
import { populateAccountingTransactionsDb } from './transactionModels/account/tables';
import { populateMultipartTransactionsDb } from './transactionModels/multipart/tables';
import { populateWalletDb } from './walletTypes/core/tables';
import { populateMemoTransactionsDb } from './memos/tables';
import { populatePricesDb } from './prices/tables';
import { populateExplorerDb } from './explorers/tables';
import { populateUtxoDb } from './utxo/tables';
import { KeyKind } from '../../cardanoCrypto/keys/types';
import { networks, defaultAssets } from './prepackaged/networks';
import { prepackagedExplorers } from './prepackaged/explorers';
import environment from '../../../../../environment';
import type { LastSyncInfoRow } from './walletTypes/core/tables';
import type { TokenRow } from './primitives/tables';

// global var from window.indexedDB
declare var indexedDB: IDBFactory;
const schemaName = 'yoroi-schema';

const deleteDb = () => new Promise(resolve => {
  const deleteRequest = indexedDB.deleteDatabase(schemaName);
  deleteRequest.onsuccess = () => resolve();
  deleteRequest.onerror = () => resolve();
});

const populateEncryptionDefault = async (
  db: lf$Database,
): Promise<void> => {
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
      const EncryptionMetaId = 0;
      const initial = getInitialSeeds();
      const metaRow = await deps.GetEncryptionMeta.getOrInitial(
        db, tx,
        { ...initial, EncryptionMetaId },
      );
      await deps.ModifyEncryptionMeta.upsert(
        db, tx,
        {
          ...metaRow,
          EncryptionMetaId
        }
      );
    }
  );
};
const populateNetworkDefaults = async (
  db: lf$Database,
): Promise<void> => {
  const deps = Object.freeze({
    GetEncryptionMeta,
    ModifyEncryptionMeta,
    ModifyNetworks,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  await raii(
    db,
    depTables,
    async tx => deps.ModifyNetworks.upsert(
      db,
      tx,
      Object.keys(networks).map(network => networks[network])
    )
  );
};
const populateExplorerDefaults = async (
  db: lf$Database,
): Promise<void> => {
  const deps = Object.freeze({
    GetEncryptionMeta,
    ModifyEncryptionMeta,
    ModifyExplorers,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  await raii(
    db,
    depTables,
    async tx => deps.ModifyExplorers.upsert(
      db,
      tx,
      [...prepackagedExplorers.values()].flat(),
    )
  );
};
const populateAssetDefaults = async (
  db: lf$Database,
): Promise<void> => {
  const deps = Object.freeze({
    ModifyToken,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  await raii(
    db,
    depTables,
    async tx => deps.ModifyToken.upsert(
      db,
      tx,
      defaultAssets,
    )
  );
};


export const loadLovefieldDB = async (
  storeType: $Values<typeof schema.DataStoreType>
): Promise<lf$Database> => {
  const db = await populateAndCreate(storeType);

  await populateEncryptionDefault(db);
  await populateNetworkDefaults(db);
  await populateExplorerDefaults(db);
  await populateAssetDefaults(db);

  return db;
};

export const loadLovefieldDBFromDump = async (
  storeType: $Values<typeof schema.DataStoreType>,
  dump: Object,
): Promise<lf$Database> => {
  const db = await populateAndCreate(storeType);

  db.import(dump);

  return db;
};

/** deletes the old database and returns the new database to use */
export async function importOldDb(
  oldDb: lf$Database,
  data: lf$lovefieldExport,
): Promise<lf$Database> {
  // we need to delete the database before we import
  // because indexedDB uses schema versions
  // and you can't import an old schema.
  await oldDb.delete();
  const schemaBuilder = schema.create(data.name, data.version);

  const db = await schemaBuilder.connect({
    storeType: schema.DataStoreType.INDEXED_DB,
  });
  await db.import(data);

  return db;
}

export async function copyDbToMemory(
  db: lf$Database
): Promise<lf$Database> {
  const data = await db.export();

  const schemaBuilder = schema.create(data.name, data.version);
  const inMemoryDb = await schemaBuilder.connect({
    storeType: schema.DataStoreType.MEMORY,
  });
  await inMemoryDb.import(data);

  return inMemoryDb;
}

const populateAndCreate = async (
  storeType: $Values<typeof schema.DataStoreType>
): Promise<lf$Database> => {
  const schemaVersion = 18;
  const schemaBuilder = schema.create(schemaName, schemaVersion);

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
  populateExplorerDb(schemaBuilder);
  populateUtxoDb(schemaBuilder);

  let db;
  try {
    db = await schemaBuilder.connect({
      storeType,
      onUpgrade,
    });
  } catch (error) {
    if (error.code === 201 /* Lovefield error code for dup pk */) {
      await fixLovefieldDuplicatePrimaryKey(error.message);
      return populateAndCreate(storeType);
    }
    throw error;
  }
  return db;
};

async function fixLovefieldDuplicatePrimaryKey(errorMessage: string): Promise<void> {
  const makeError = (message) => new Error(
    `Error when fixing ${errorMessage}: ${message}`
  );
  const params = new URL(errorMessage).searchParams;
  const [storeName, keyName] = String(params.get('p0')).split('.');
  if (keyName !== 'pk' + storeName) {
    throw makeError('unexpected key name');
  }
  const fieldName = storeName + 'Id';
  const dupVal = params.get('p1');

  const toPromise = (request, errMsg) => new Promise((resolve, reject) => {
    request.onerror = (_event) => {
      reject(makeError(errMsg));
    };
    request.onsuccess = (_event) => {
      resolve(request.result);
    };
  });

  const db = await toPromise(
    window.indexedDB.open('yoroi-schema'),
    'could not open DB',
  );

  const store = db
    .transaction([storeName], 'readwrite')
    .objectStore(storeName);

  const allObjects = await toPromise(
    store.getAll(),
    'could not get all objects',
  );
  const dupObjects = allObjects.filter(
    obj => String(obj.value[fieldName]) === dupVal
  );
  for (const dupObj of dupObjects.slice(1)) {
    await toPromise(
      store.delete(dupObj.id),
      'could not delete duplicate object',
    );
  }
}

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

async function deleteTxTables(
  rawDb: lf$raw$BackStore,
): Promise<void> {
  // note: no need to commit for raw transactions
  const tx = rawDb.getRawTransaction();

  const tablesToDelete = [
    'AccountingTransactionInput',
    'AccountingTransactionOutput',
    'Block',
    'Certificate',
    'CertificateAddress',
    'TokenList',
    'Transaction',
    'UtxoTransactionInput',
    'UtxoTransactionOutput',
    'Token',
  ];
  const lastSyncBackingStore = tx.objectStore('LastSyncInfo');
  const allLastSync = await promisifyDbCall<$ReadOnlyArray<$ReadOnly<{|
    id: number,
    value: $ReadOnly<LastSyncInfoRow>
  // $FlowExpectedError[prop-missing] missing function in Flow built-in types
  |}>>>(lastSyncBackingStore.getAll());

  const tokenBackingStore = tx.objectStore('Token');
  const allTokens = await promisifyDbCall<$ReadOnlyArray<$ReadOnly<{|
    id: number,
    value: $ReadOnly<TokenRow>
  // $FlowExpectedError[prop-missing] missing function in Flow built-in types
  |}>>>(tokenBackingStore.getAll());

  for (const table of tablesToDelete) {
    try {
      const tableBackingStore = tx.objectStore(table);
      await promisifyDbCall<void>(tableBackingStore.clear());
    } catch (_e) {} // eslint-disable-line no-empty
  }
  // add back all the lastSyncInfo entries which need to exist for every public deriver
  for (const lastSyncRow of allLastSync) {
    const tableBackingStore = tx.objectStore('LastSyncInfo');
    await promisifyDbCall<void>(tableBackingStore.put({
      id: lastSyncRow.id,
      value: {
        LastSyncInfoId: lastSyncRow.value.LastSyncInfoId,
        Time: new Date(Date.now()).getTime(),
        SlotNum: null,
        Height: 0,
        BlockHash: null,
      },
    }));
  }
  // add back the default tokens
  for (const tokenRow of allTokens.filter(row => row.value.IsDefault === true)) {
    const tableBackingStore = tx.objectStore('Token');
    await promisifyDbCall<void>(tableBackingStore.put({
      id: tokenRow.id,
      value: tokenRow.value,
    }));
  }
  // note: no need to commit for raw transactions
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
    return;
  }
  if (version === 2) {
    // if user was in the balance-check version of Yoroi
    // they have an incompatible DB and we don't care about it
    // so we just delete it entirely
    await deleteDb();
    // need to refresh for page to re-create new DB
    window.location.reload();
    return;
  }
  if (version === 3) {
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
      return;
    }
  }
  if (version >= 3 && version <= 4) {
    // we know that before this version, Yoroi only supported 1 wallet
    // therefore the single wallet always has its root key as derivation id 1
    // and we only launched the new DB for the Jormungandr Shelley testnet
    // so there are only Cip1852 wallets
    await rawDb.addTableColumn(
      'Cip1852Wrapper',
      'RootKeyDerivationId',
      1
    );
  }
  if (version === 6 || version === 7) {
    // fix mistake of assuming tx hash was always unencrypted
    const tx = rawDb.getRawTransaction();
    const txMemoStore = tx.objectStore('TxMemo');
    await promisifyDbCall<void>(txMemoStore.clear());
    // note: no need to commit for raw transactions
  }

  if (version >= 3 && version <= 9) {
    await rawDb.dropTableColumn(
      'Bip44Wrapper',
      'Bip44WrapperId',
    );
    await rawDb.dropTableColumn(
      'Cip1852Wrapper',
      'Cip1852WrapperId',
    );
  }

  if (version >= 3 && version <= 10) {
    await rawDb.addTableColumn(
      'Key',
      'Type',
      KeyKind.BIP32ED25519,
    );
  }
  if (version >= 3 && version <= 11) {
    await rawDb.dropTableColumn(
      'ConceptualWallet',
      'CoinType',
    );
    await rawDb.addTableColumn(
      'ConceptualWallet',
      'NetworkId',
      // recall: at the time we only supported 1 currency per Yoroi install
      networks.CardanoMainnet.NetworkId
    );
  }
  if (version >= 3 && version <= 12) {
    if (environment.isNightly()) {
      // nightly used to run on ITN, but we want to switch it to run on main Yoroi instead
      await deleteDb();
      window.location.reload();
    }
    await rawDb.addTableColumn(
      'Transaction',
      'Type',
      // recall: at the time we only supported Byron at this time
      TransactionType.CardanoByron
    );
    await rawDb.addTableColumn(
      'Transaction',
      'Extra',
      // recall: at the time we only supported Byron at this time
      null
    );
  }
  if (version >= 3 && version <= 13) {
    await rawDb.addTableColumn(
      'Certificate',
      'Ordinal',
      // recall: certificates weren't supported at this time
      TransactionType.CardanoByron
    );
  }
  if (version >= 3 && version <= 15) {
    await deleteTxTables(rawDb);
  }
  if (version < 18) {
    await rawDb.addTableColumn(
      'Address',
      'IsUsed',
      false
    );
  }
}
