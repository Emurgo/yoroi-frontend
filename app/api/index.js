// @flow
import AdaApi from './ada/index';
import LocalStorageApi from './localStorage/index';
import ExternalStorageApi from './externalStorage/index';
import ExportApi from './export/index';
import UtilityKeyApi from './utilityKey/index';

export type Api = {
  ada: AdaApi,
  localStorage: LocalStorageApi,
  externalStorage: ExternalStorageApi,
  export: ExportApi,
  utilityKey: UtilityKeyApi,
};

export const setupApi = (): Api => ({
  ada: new AdaApi(),
  localStorage: new LocalStorageApi(),
  externalStorage: new ExternalStorageApi(),
  export: new ExportApi(),
  utilityKey: new UtilityKeyApi(),
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
