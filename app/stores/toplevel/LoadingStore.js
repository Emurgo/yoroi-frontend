// @flow
import { action, observable, computed, when, runInAction } from 'mobx';
import Store from '../base/Store';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import { matchRoute } from '../../utils/routing';
import { getURIParameters } from '../../utils/URIHandling';
import type { UriParams } from '../../utils/URIHandling';
import LocalizableError from '../../i18n/LocalizableError';
import { UnableToLoadError } from '../../i18n/errors';
import Request from '../lib/LocalizedRequest';
import type { MigrationRequest } from '../../api';
import { migrate } from '../../api';
import { Logger, stringifyError } from '../../utils/logging';
import { closeOtherInstances } from '../../utils/tabManager';

import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

/** Load dependencies before launching the app */
export default class LoadingStore extends Store {

  @observable error: ?LocalizableError = null;
  @observable _loading: boolean = true;

  /**
   * null if app not opened from URI Scheme OR URI scheme was invalid
   */
  @observable _uriParams: ?UriParams = null;

  _originRoute: {
    route: string, // internal route
    location: string, // full URL
  } = { route: '', location: '' };

  @observable loadRustRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(RustModule.load.bind(RustModule));

  @observable migrationRequest: Request<MigrationRequest => Promise<void>>
    = new Request<MigrationRequest => Promise<void>>(migrate);

  // TODO: Should not make currency-specific requests in a toplevel store
  @observable loadDbRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.api.ada.loadDB);

  setup() {
    this.actions.snapshot.migrateImportedSnapshot.listen(this._migrateImported);
  }

  load() {
    when(this._isRefresh, this._redirectToLoading);
    Promise
      .all([this.loadRustRequest.execute().promise, this.loadDbRequest.execute().promise])
      .then(async () => {
        closeOtherInstances();
        await this.migrationRequest.execute({
          api: this.api,
          currVersion: environment.version
        }).promise;
        await this.validateUriPath();
        runInAction(() => {
          this.error = null;
          this._loading = false;
        });
        return undefined;
      }).catch((error) => {
        Logger.error('LoadingStore::setup Unable to load libraries ' + stringifyError(error));
        runInAction(() => {
          this.error = new UnableToLoadError();
          this._loading = false;
        });
      });
  }

  @computed get isLoading(): boolean {
    return !!this._loading;
  }

  @computed get fromUriScheme(): boolean {
    return matchRoute(ROUTES.SEND_FROM_URI.ROOT, this._originRoute.route);
  }

  @computed get uriParams(): ?UriParams {
    return this._uriParams;
  }

  @action
  validateUriPath = async (): Promise<void> => {
    if (this.fromUriScheme) {
      const uriParams = await getURIParameters(
        decodeURIComponent(this._originRoute.location),
        this.stores.substores.ada.wallets.isValidAddress
      );
      runInAction(() => {
        this._uriParams = uriParams;
      });
    }
  }

  /**
   * Need to clear any data inijected by the URI after we've applied it
   */
  @action
  resetUriParams = (): void => {
    this._uriParams = null;
    this._originRoute = { route: '', location: '' };
  }

  _isRefresh = (): boolean => this.isLoading;

  _redirectToLoading = (): void => {
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

  _migrateImported = (): void => {
    this.migrationRequest.execute({
      api: this.api,
      currVersion: environment.version
    }).promise;
  };
}
