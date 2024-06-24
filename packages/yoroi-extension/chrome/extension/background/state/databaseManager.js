// @flow
import { environment } from '../../../../app/environment';
import { schema } from 'lovefield';
import { copyDbToMemory, loadLovefieldDB, } from '../../../../app/api/ada/lib/storage/database/index';
import { migrateNoRefresh } from '../../../../app/api/common/migration';
import LocalStorageApi from '../../../../app/api/localStorage/index';
import type { lf$Database, } from 'lovefield';

let dbCache = null;
let migratePromiseCache = null;

async function _getDb(): Promise<lf$Database> {
  const localStorageApi = new LocalStorageApi();

  if (!dbCache) {
    dbCache = await loadLovefieldDB(schema.DataStoreType.INDEXED_DB);
  }
  
  if (!migratePromiseCache) {
    migratePromiseCache =  migrateNoRefresh({
      localStorageApi,
      persistentDb: dbCache,
      currVersion: environment.getVersion(),
    });
  }
  await migratePromiseCache;

  return dbCache;
}

// Get the db handle. The client should only read from the db.
export async function getDb(): Promise<lf$Database> {
  const db = await _getDb();

  // To be extra safe, we return an in-memory copy of the DB to the caller.
  // So if the caller mistakenly update the database,
  // the changes are lost but the db won't be corrupt due to concurrent writes.
  return await copyDbToMemory(db);
}

