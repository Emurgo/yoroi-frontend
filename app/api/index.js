// @flow

import {
  schema,
} from 'lovefield';
import type { lf$Database } from 'lovefield';
import AdaApi from './ada/index';
import LocalStorageApi from './localStorage/index';
import ExportApi from './export/index';
import {
  loadLovefieldDB,
} from './ada/lib/storage/database/index';

export type Api = {
  ada: AdaApi,
  localStorage: LocalStorageApi,
  export: ExportApi,
  persistentDb: lf$Database,
};

export const setupApi = async (): Promise<Api> => ({
  ada: new AdaApi(),
  localStorage: new LocalStorageApi(),
  export: new ExportApi(),
  persistentDb: await loadLovefieldDB(schema.DataStoreType.INDEXED_DB),
});

export type MigrationRequest = {
  api: Api,
  currVersion: string,
}

export const migrate = async (migrationRequest: MigrationRequest): Promise<void> => {
  const lastLaunchVersion = await migrationRequest.api.localStorage.getLastLaunchVersion();
  if (lastLaunchVersion === migrationRequest.currVersion) {
    return;
  }

  const appliedMigration = await migrationRequest.api.ada.migrate(
    migrationRequest.api.localStorage,
    migrationRequest.api.persistentDb,
  );

  // update launch version in localstorage to avoid calling migration twice
  await migrationRequest.api.localStorage.setLastLaunchVersion(migrationRequest.currVersion);

  /**
   * If a single migration step happened, then we have have to reload the UI
   * Systems like mobx and react may not notice that the data has changed under their feed
   */
  if (appliedMigration) {
    window.location.reload();
    // we want to block until the refresh closes our page
    // if we don't block forever here,
    // then Yoroi would start and may get in a bad state with migrations partially applied
    // since reload is not a blocking call we just await on a timeout
    await (new Promise(resolve => setTimeout(resolve, 5000 /* aribtrary high number */)));
  }
};
