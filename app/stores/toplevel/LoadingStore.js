// @flow
import type { lf$Database, lf$lovefieldExport, } from 'lovefield';
import { schema, } from 'lovefield';
import BigNumber from 'bignumber.js';
import { action, observable, computed, when, runInAction } from 'mobx';
import { pathToRegexp } from 'path-to-regexp';
import Store from '../base/Store';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import { matchRoute } from '../../utils/routing';
import { getURIParameters } from '../../utils/URIHandling';
import type { UriParams } from '../../utils/URIHandling';
import LocalizableError from '../../i18n/LocalizableError';
import { UnableToLoadError, StorageLoadError } from '../../i18n/errors';
import Request from '../lib/LocalizedRequest';
import type { MigrationRequest } from '../../api';
import { migrate } from '../../api';
import { Logger, stringifyError } from '../../utils/logging';
import { closeOtherInstances } from '../../utils/tabManager';
import { loadLovefieldDB, importOldDb, } from '../../api/ada/lib/storage/database/index';
import { isWithinSupply } from '../../utils/validations';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { networks, defaultAssets } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { getDefaultEntryToken } from './TokenInfoStore';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

/** Load dependencies before launching the app */
export default class LoadingStore extends Store<StoresMap, ActionsMap> {

  @observable error: ?LocalizableError = null;
  @observable _loading: boolean = true;

  /**
   * null if app not opened from URI Scheme OR URI scheme was invalid
   */
  @observable _uriParams: ?UriParams = null;
  @observable _shouldRedirect: boolean = false;
  @observable _redirectUri: string = '';

  _originRoute: {|
    // internal route
    route: string,
    // full URL
    location: string,
  |} = { route: '', location: '' };

  @observable loadRustRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(RustModule.load.bind(RustModule));

  @observable migrationRequest: Request<MigrationRequest => Promise<void>>
    = new Request<MigrationRequest => Promise<void>>(migrate);

  @observable loadPersistentDbRequest: Request<void => Promise<lf$Database>>
    = new Request<void => Promise<lf$Database>>(
      async () => await loadLovefieldDB(schema.DataStoreType.INDEXED_DB)
    );

  setup(): void {
    this.actions.loading.redirect.listen(this._redirect);
  }

  load(): void {
    when(this._isRefresh, this._redirectToLoading);
    Promise
      .all([
        this.loadRustRequest.execute().promise,
        this.loadPersistentDbRequest.execute().promise
      ])
      .then(async () => {
        await closeOtherInstances();
        const persistentDb = this.loadPersistentDbRequest.result;
        if (persistentDb == null) throw new Error(`${nameof(LoadingStore)}::${nameof(this.load)} load db was not loaded. Should never happen`);
        await this.migrationRequest.execute({
          api: this.api,
          persistentDb,
          currVersion: environment.getVersion(),
        }).promise;
        await this.validateUriPath();
        runInAction(() => {
          this.error = null;
          this._loading = false;
        });
        return undefined;
      }).catch((error) => {
        Logger.error(`${nameof(LoadingStore)}::${nameof(this.load)} Unable to load libraries ` + stringifyError(error));
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

  @computed get fromUriScheme(): boolean {
    return matchRoute(ROUTES.SEND_FROM_URI.ROOT, this._originRoute.route) !== false;
  }

  @computed get uriParams(): ?UriParams {
    return this._uriParams;
  }

  @computed get shouldRedirect(): boolean {
    return this._shouldRedirect;
  }

  @computed get redirectUri() : string {
    return this._redirectUri;
  }

  @action
  validateUriPath: void => Promise<void> = async (): Promise<void> => {
    if (this.fromUriScheme) {
      const networkId = networks.CardanoMainnet.NetworkId;
      const cardanoMeta = defaultAssets.filter(
        asset => asset.NetworkId === networkId
      )[0];
      const uriParams = await getURIParameters(
        decodeURIComponent(this._originRoute.location),
        currency => {
          // check only currency type from URL, supports only Cardano URL currently
          const valid = currency === 'cardano';
          return Promise.resolve(valid);
        },
        amount => isWithinSupply(amount, new BigNumber(Number.MAX_SAFE_INTEGER)),
        cardanoMeta.Metadata.numberOfDecimals,
        getDefaultEntryToken(cardanoMeta)
      );
      runInAction(() => {
        this._uriParams = uriParams;
      });
    }
  }

  /**
   * Need to clear any data injected by the URI after we've applied it
   */
  @action
  resetUriParams: void => void = (): void => {
    this._uriParams = null;
    this._originRoute = { route: '', location: '' };
  }

  @action
  _redirect: void => void = () => {
    this._shouldRedirect = false;
    this.actions.router.goToRoute.trigger({
      route: this._redirectUri
    });
  }

  _redirectRegex: RegExp = pathToRegexp(ROUTES.OAUTH_FROM_EXTERNAL.DROPBOX);

  _isRefresh: void => boolean = () => this.isLoading;

  _redirectToLoading: void => void = () => {
    if (this._redirectRegex.test(this.stores.app.currentRoute)) {
      this._shouldRedirect = true;
      this._redirectUri = this.stores.app.currentRoute;
    }
    // before redirecting, save origin route in case we need to come back to
    // it later (this is the case when user comes from a URI link)
    runInAction(() => {
      this._originRoute = {
        route: this.stores.app.currentRoute,
        location: window.location.href,
      };
      // note: we don't validate the path since we need to wait for the WASM bindings to load first
    });
    this.actions.router.goToRoute.trigger({ route: ROUTES.ROOT });
  }
}
