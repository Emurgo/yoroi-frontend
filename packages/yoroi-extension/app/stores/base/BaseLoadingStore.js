// @flow
import type { lf$Database, lf$lovefieldExport, } from 'lovefield';
import { schema, } from 'lovefield';
import { observable, computed, when, runInAction } from 'mobx';
import Store from './Store';
import environment from '../../environment';
import LocalizableError from '../../i18n/LocalizableError';
import { UnableToLoadError, StorageLoadError } from '../../i18n/errors';
import Request from '../lib/LocalizedRequest';
import type { MigrationRequest } from '../../api/common/migration';
import { migrateAndRefresh } from '../../api/common/migration';
import { Logger, stringifyError } from '../../utils/logging';
import { closeOtherInstances } from '../../utils/tabManager';
import { loadLovefieldDB, importOldDb, } from '../../api/ada/lib/storage/database/index';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

/** Load dependencies before launching the app */
export default class BaseLoadingStore<TStores, TActions> extends Store<TStores, TActions> {

  @observable error: ?LocalizableError = null;
  @observable _loading: boolean = true;

  @observable loadRustRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(RustModule.load.bind(RustModule));

  @observable migrationRequest: Request<MigrationRequest => Promise<void>>
    = new Request<MigrationRequest => Promise<void>>(migrateAndRefresh);

  // note: never get anything but result except for the .error inside this file
  @observable loadPersistentDbRequest: Request<void => Promise<lf$Database>>
    = new Request<void => Promise<lf$Database>>(
      async () => await loadLovefieldDB(schema.DataStoreType.INDEXED_DB)
    );

  setup(): void {
  }

  load(): void {
    when(() => this.isLoading, this.postLoadingScreenEnd.bind(this));
    Promise
      .all([
        this.loadRustRequest.execute().promise,
        this.loadPersistentDbRequest.execute().promise
      ])
      .then(async () => {
        Logger.debug(`[yoroi] closing other instances`);
        await closeOtherInstances(this.getTabIdKey.bind(this)());
        Logger.debug(`[yoroi] loading persistent db`);
        const persistentDb = this.loadPersistentDbRequest.result;
        if (persistentDb == null) throw new Error(`${nameof(BaseLoadingStore)}::${nameof(this.load)} load db was not loaded. Should never happen`);
        Logger.debug(`[yoroi] check migrations`);
        await this.migrationRequest.execute({
          localStorageApi: this.api.localStorage,
          persistentDb,
          currVersion: environment.getVersion(),
        }).promise;
        Logger.debug(`[yoroi][preLoadingScreenEnd]`);
        await this.preLoadingScreenEnd.bind(this)();
        runInAction(() => {
          this.error = null;
          this._loading = false;
          Logger.debug(`[yoroi] loading ended`);
        });
        return undefined;
      }).catch((error) => {
        Logger.error(`${nameof(BaseLoadingStore)}::${nameof(this.load)} Unable to load libraries ` + stringifyError(error));
        if (this.loadPersistentDbRequest.error != null) {
          runInAction(() => {
            this.error = new StorageLoadError();
          });
        } else {
          runInAction(() => {
            this.error = new UnableToLoadError();
          });
        }
      });
  }

  importOldDatabase: (
    lf$lovefieldExport,
  ) => Promise<void> = async (data) => {
    const db = this.loadPersistentDbRequest.result;
    if (db == null) throw new Error(`${nameof(this.importOldDatabase)} db not loaded yet`);
    await importOldDb(db, data);
    window.location.reload();
  }

  @computed get isLoading(): boolean {
    return !!this._loading;
  }

  getTabIdKey(): string {
    throw new Error(`${nameof(BaseLoadingStore)}::${nameof(this.getTabIdKey)} child needs to override this function`);
  }

  getDatabase(): ?lf$Database {
    throw new Error(`${nameof(BaseLoadingStore)}::${nameof(this.getDatabase)} child needs to override this function`);
  }

  async preLoadingScreenEnd(): Promise<void> {
    // eslint-disable-line no-empty-function
  }
  postLoadingScreenEnd(): void {
    // eslint-disable-line no-empty-function
  }
}
