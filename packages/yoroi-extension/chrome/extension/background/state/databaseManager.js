// @flow
import { environment } from '../../../../app/environment';
import { schema } from 'lovefield';
import { loadLovefieldDB, } from '../../../../app/api/ada/lib/storage/database/index';
import { migrateNoRefresh } from '../../../../app/api/common/migration';
import LocalStorageApi from '../../../../app/api/localStorage/index';
import type { lf$Database, } from 'lovefield';

let loadDbPromiseCache = null;
let migratePromiseCache = null;

export async function getDb(): Promise<lf$Database> {
  const localStorageApi = new LocalStorageApi();

  if (!loadDbPromiseCache) {
    loadDbPromiseCache = loadLovefieldDB(schema.DataStoreType.INDEXED_DB);
  }

  const db = await loadDbPromiseCache;

  if (!migratePromiseCache) {
    migratePromiseCache =  migrateNoRefresh({
      localStorageApi,
      persistentDb: db,
      currVersion: environment.getVersion(),
    });
  }
  await migratePromiseCache;

  return db;
}
