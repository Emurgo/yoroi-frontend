// @flow
import type { lf$Database, } from 'lovefield';
import CommonApi from './common/index';
import AdaApi from './ada/index';
import ErgoApi from './ergo/index';
import JormungandrApi from './jormungandr/index';
import LocalStorageApi from './localStorage/index';
import ExternalStorageApi from './externalStorage/index';
import ExportApi from './export/index';

export type Api = {|
  common: CommonApi,
  ada: AdaApi,
  ergo: ErgoApi,
  jormungandr: JormungandrApi,
  localStorage: LocalStorageApi,
  externalStorage: ExternalStorageApi,
  export: ExportApi,
|};

export const setupApi: void => Promise<Api> = async () => ({
  common: new CommonApi(),
  ada: new AdaApi(),
  ergo: new ErgoApi(),
  jormungandr: new JormungandrApi(),
  localStorage: new LocalStorageApi(),
  externalStorage: new ExternalStorageApi(),
  export: new ExportApi(),
});

export type MigrationRequest = {|
  api: Api,
  persistentDb: lf$Database,
  currVersion: string,
|}

export const migrate: MigrationRequest => Promise<void> = async (migrationRequest) => {
  const lastLaunchVersion = await migrationRequest.api.localStorage.getLastLaunchVersion();
  if (lastLaunchVersion === migrationRequest.currVersion) {
    return;
  }

  const appliedMigration = await migrationRequest.api.common.migrate(
    migrationRequest.api.localStorage,
    migrationRequest.persistentDb,
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
    await (new Promise(resolve => setTimeout(resolve, 5000 /* arbitrary high number */)));
  }
};
