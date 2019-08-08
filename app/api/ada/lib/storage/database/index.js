// @flow

import {
  schema
} from 'lovefield';
import type { lf$raw$BackStore, lf$Database } from 'lovefield';

import { populateUncategorizedDb } from './uncategorized/tables';
import { populateBip44Db } from './genericBip44/tables';

export const loadLovefieldDB = async (inMemory: boolean): Promise<lf$Database> => {
  const schemaBuilder = schema.create('yoroi-schema', 2);

  populateUncategorizedDb(schemaBuilder);
  populateBip44Db(schemaBuilder);

  return await schemaBuilder.connect({
    onUpgrade,
    storeType: inMemory
      ? schema.DataStoreType.MEMORY
      : schema.DataStoreType.INDEXED_DB
  });
};

async function onUpgrade(rawDb: lf$raw$BackStore) {
  const version = rawDb.getVersion();
  if (version === 1) {
    // v1 of the DB did not store any information that can't be inferred from the blockchain
    await rawDb.dropTable('Addresses');
    await rawDb.dropTable('Txs');
    await rawDb.dropTable('TxAddresses');
  }
}
