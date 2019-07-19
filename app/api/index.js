// @flow
import AdaApi from './ada/index';
import LocalStorageApi from './localStorage/index';
import ExportApi from './export/index';

export type Api = {
  ada: AdaApi,
  localStorage: LocalStorageApi,
  export: ExportApi,
};

export const setupApi = (): Api => ({
  ada: new AdaApi(),
  localStorage: new LocalStorageApi(),
  export: new ExportApi(),
});

export type MigrationRequest = {
  api: Api,
  currVersion: string,
  isImported: boolean
}

export const migrate = async (migrationRequest: MigrationRequest): Promise<void> => {
  const lastLaunchVersion = await migrationRequest.api.localStorage.getLastLaunchVersion();
  if (lastLaunchVersion === migrationRequest.currVersion) {
    return;
  }

  // localstorage empty means the user is launching Yoroi for the first time. No need to migrate.
  const isEmpty = await migrationRequest.api.localStorage.isEmpty();
  if (!isEmpty) {
    await migrationRequest.api.ada.migrate(
      migrationRequest.api.localStorage,
      migrationRequest.isImported
    );
  }

  // update launch version in localstorage to avoid calling migration twice
  await migrationRequest.api.localStorage.setLastLaunchVersion(migrationRequest.currVersion);
};
