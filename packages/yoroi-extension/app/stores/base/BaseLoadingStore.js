// @flow
import type { lf$Database, lf$lovefieldExport, } from 'lovefield';
import { schema, } from 'lovefield';
import { computed, observable, runInAction } from 'mobx';
import Store from './Store';
import environment from '../../environment';
import LocalizableError from '../../i18n/LocalizableError';
import { StorageLoadError, UnableToLoadError } from '../../i18n/errors';
import Request from '../lib/LocalizedRequest';
import type { MigrationRequest } from '../../api/common/migration';
import { migrateAndRefresh } from '../../api/common/migration';
import { Logger, stringifyError } from '../../utils/logging';
import { closeOtherInstances } from '../../utils/tabManager';
import { importOldDb, loadLovefieldDB, } from '../../api/ada/lib/storage/database/index';
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
      () => loadLovefieldDB(schema.DataStoreType.INDEXED_DB)
    );

  __blockingLoadingRequests: Array<[Request<() => Promise<void>>, string]> = [];

  setup(): void {
  }

  registerBlockingLoadingRequest(promise: Promise<void>, name: string): void {
    // promises are wrapped as requests to easier check their errors later
    this.__blockingLoadingRequests.push([new Request(() => promise), name]);
  }

  async load(env: 'connector' | 'extension'): Promise<void> {
    const rustLoadingParams = (env === 'extension') ? ['dontLoadMessagesSigning'] : [];
    await Promise
      .all([
        // $FlowIgnore[invalid-tuple-arity]
        this.loadRustRequest.execute(rustLoadingParams),
        this.loadPersistentDbRequest.execute(),
        ...(this.__blockingLoadingRequests.map(([r]) => r.execute())),
      ])
      .then(async () => {
        Logger.debug(`[yoroi] closing other instances`);
        await closeOtherInstances(this.getTabIdKey.bind(this)());
        Logger.debug(`[yoroi] loading persistent db`);
        const persistentDb = this.loadPersistentDbRequest.result;
        if (persistentDb == null) {
          throw new Error(
            `${nameof(BaseLoadingStore)}::${nameof(this.load)}
             DB was not loaded. Should never happen`
          );
        }
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
          this.postLoadingScreenEnd();
          Logger.debug(`[yoroi] loading ended`);
        });
        return undefined;
      })
      .catch((error) => {
        const isRustLoadError = this.loadRustRequest.error != null;
        const isDbLoadError = this.loadPersistentDbRequest.error != null;
        const failedBlockingLoadingRequestName =
          this.__blockingLoadingRequests.find(([r]) => r.error != null)?.[1];
        const errorType =
          (isRustLoadError && 'rust')
          || (isDbLoadError && 'db')
          || failedBlockingLoadingRequestName
          || 'unclear';
        Logger.error(
          `${nameof(BaseLoadingStore)}::${nameof(this.load)}
           Unable to load libraries (error type: ${errorType}) `
          + stringifyError(error)
        );
        runInAction(() => {
          this.error = isDbLoadError ? new StorageLoadError() : new UnableToLoadError();
        });
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
