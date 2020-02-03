// @flow
import type { lf$Database, } from 'lovefield';
import { schema, } from 'lovefield';
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
import { loadLovefieldDB, } from '../../api/ada/lib/storage/database/index';
import { tryAddressToKind } from '../../api/ada/lib/storage/bridge/utils';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';

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

  @observable loadPersitentDbRequest: Request<void => Promise<lf$Database>>
    = new Request<void => Promise<lf$Database>>(
      async () => await loadLovefieldDB(schema.DataStoreType.INDEXED_DB)
    );

  load(): void {
    when(this._isRefresh, this._redirectToLoading);
    Promise
      .all([
        this.loadRustRequest.execute().promise,
        this.loadPersitentDbRequest.execute().promise
      ])
      .then(async () => {
        await closeOtherInstances();
        const persistentDb = this.loadPersitentDbRequest.result;
        if (persistentDb == null) throw new Error(`${nameof(LoadingStore)}::${nameof(this.load)} load db was not loaded. Should never happen`);
        await this.migrationRequest.execute({
          api: this.api,
          persistentDb,
          currVersion: environment.version,
        }).promise;
        await this.validateUriPath();
        runInAction(() => {
          this.error = null;
          this._loading = false;
        });
        return undefined;
      }).catch((error) => {
        Logger.error(`${nameof(LoadingStore)}::${nameof(this.load)} Unable to load libraries ` + stringifyError(error));
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
    return matchRoute(ROUTES.SEND_FROM_URI.ROOT, this._originRoute.route) !== false;
  }

  @computed get uriParams(): ?UriParams {
    return this._uriParams;
  }

  @action
  validateUriPath: void => Promise<void> = async (): Promise<void> => {
    if (this.fromUriScheme) {
      const uriParams = await getURIParameters(
        decodeURIComponent(this._originRoute.location),
        address => {
          const addressKind = tryAddressToKind(address, 'bech32');
          const valid = environment.isShelley()
            ? addressKind != null && addressKind !== CoreAddressTypes.CARDANO_LEGACY
            : addressKind != null && addressKind === CoreAddressTypes.CARDANO_LEGACY;
          return Promise.resolve(valid);
        }
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
  resetUriParams: void => void = (): void => {
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
}
