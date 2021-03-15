// @flow
import type { lf$Database, lf$lovefieldExport, } from 'lovefield';
import { schema, } from 'lovefield';
import { observable, computed, when, runInAction } from 'mobx';
import Store from './Store';
import environment from '../../environment';
import LocalizableError from '../../i18n/LocalizableError';
import { UnableToLoadError, StorageLoadError } from '../../i18n/errors';
import Request from '../lib/LocalizedRequest';
import type { MigrationRequest } from '../../api';
import { migrate } from '../../api';
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
    = new Request<MigrationRequest => Promise<void>>(migrate);

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
        await closeOtherInstances(); // TODO: make this generic
        const persistentDb = this.loadPersistentDbRequest.result;
        if (persistentDb == null) throw new Error(`${nameof(BaseLoadingStore)}::${nameof(this.load)} load db was not loaded. Should never happen`);
        // TODO: does the logic in here still work if the connector is the one accessing the info?
        await this.migrationRequest.execute({
          api: this.api,
          persistentDb,
          currVersion: environment.getVersion(),
        }).promise;
        await this.preLoadingScreenEnd.bind(this);
        runInAction(() => {
          this.error = null;
          this._loading = false;
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

  async preLoadingScreenEnd(): Promise<void> {
    // eslint-disable-line no-empty-function
  }
  postLoadingScreenEnd(): void {
    // eslint-disable-line no-empty-function
  }
}
