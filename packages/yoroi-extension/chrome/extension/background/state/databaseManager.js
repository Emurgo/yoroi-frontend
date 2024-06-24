// @flow
import { environment } from '../../../../app/environment';
import { schema } from 'lovefield';
import { loadLovefieldDB, } from '../../../../app/api/ada/lib/storage/database/index';
import { migrateNoRefresh } from '../../../../app/api/common/migration';
import LocalStorageApi from '../../../../app/api/localStorage/index';
import type { lf$Database, } from 'lovefield';

let dbCache = null;
let migratePromiseCache = null;

export async function getDb(): Promise<lf$Database> {
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
