// @flow
import type { lf$Database, } from 'lovefield';
import AdaApi from './ada/index';
import LocalStorageApi from './localStorage/index';
import ExternalStorageApi from './externalStorage/index';
import ExportApi from './export/index';
import type { CoinTypesT } from '../config/numbersConfig';
import { CoinTypes } from '../config/numbersConfig';

export const ApiOptions = Object.freeze({
  ada: 'ada',
});
export type ApiOptionType = $Values<typeof ApiOptions>;

export const getApiForCoinType: CoinTypesT => ApiOptionType = (type) => {
  if (type === CoinTypes.CARDANO) {
    return ApiOptions.ada;
  }
  throw new Error(`${nameof(getApiForCoinType)} missing entry for coin type ${type}`);
};

export type Api = {|
  ada: AdaApi,
  localStorage: LocalStorageApi,
  externalStorage: ExternalStorageApi,
  export: ExportApi,
|};

export const setupApi: void => Promise<Api> = async () => ({
  ada: new AdaApi(),
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

  const appliedMigration = await migrationRequest.api.ada.migrate(
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
