// @flow

import type { lf$Database, } from 'lovefield';
import { migrateToLatest } from '../ada/lib/storage/adaMigration';
import LocalStorageApi from '../localStorage/index';

export type MigrationRequest = {|
  localStorageApi: LocalStorageApi,
  persistentDb: lf$Database,
  currVersion: string,
|}

export const migrateNoRefresh: MigrationRequest => Promise<boolean> = async (migrationRequest) => {
  const lastLaunchVersion = await migrationRequest.localStorageApi.getLastLaunchVersion();
  if (lastLaunchVersion === migrationRequest.currVersion) {
    return false;
  }

  const appliedMigration = await migrateToLatest(
    migrationRequest.localStorageApi,
    migrationRequest.persistentDb,
  );

  // update launch version in localstorage to avoid calling migration twice
  await migrationRequest.localStorageApi.setLastLaunchVersion(migrationRequest.currVersion);

  return appliedMigration;
};

export const migrateAndRefresh: MigrationRequest => Promise<void> = async (migrationRequest) => {
  const appliedMigration = await migrateNoRefresh(migrationRequest);

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
    await (new Promise(resolve => setTimeout(resolve, 5000 /* arbitrary high number */)));
  }
};
