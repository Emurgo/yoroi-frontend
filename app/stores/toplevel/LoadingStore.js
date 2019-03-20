// @flow
import { observable, computed, when, runInAction } from 'mobx';
import Store from '../base/Store';
import Wallet from '../../domain/Wallet';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import LocalizableError, {
  localizedError
} from '../../i18n/LocalizableError';
import Request from '../lib/LocalizedRequest';
import type { MigrationRequest } from '../../api';
import { migrate } from '../../api';
import { Logger, stringifyError } from '../../utils/logging';

import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

/** Load dependencies before launching the app */
export default class LoadingStore extends Store {

  @observable error: ?LocalizableError = null;
  @observable _loading: boolean = true;

  @observable loadRustRequest: Request<void> = new Request(RustModule.load.bind(RustModule));
  @observable migrationRequest: Request<MigrationRequest> = new Request(migrate);

  // TODO: Should not make currency-specific requests in a toplevel store
  @observable loadDbRequest: Request<void> = new Request(this.api.ada.loadDB);

  setup() {
  }

  load() {
    when(this._isRefresh, this._redirectToLoading);
    Promise
      .all([this.loadRustRequest.execute().promise, this.loadDbRequest.execute().promise])
      .then(async () => {
        await this.migrationRequest.execute({
          api: this.api,
          currVersion: environment.version
        }).promise;
        await this._openPageAfterLoad();
        runInAction(() => {
          this.error = null;
          this._loading = false;
        });
        return undefined;
      }).catch((error) => {
        Logger.error('LoadingStore::setup Unable to load libraries ' + stringifyError(error));
        runInAction(() => {
          this.error = localizedError(new UnableToLoadError());
          this._loading = false;
        });
      });
  }

  @computed get isLoading(): boolean {
    return !!this._loading;
  }

  _isRefresh = (): boolean => this.isLoading;

  _redirectToLoading = (): void => (
    this.actions.router.goToRoute.trigger({ route: ROUTES.ROOT })
  );

  /** Select which page to open after app is done loading */
  _openPageAfterLoad = async (): Promise<void> => {
    const { app } = this.stores;
    const { wallets } = this.stores.substores[environment.API];
    await wallets.refreshWalletsData();
    if (app.currentRoute === ROUTES.ROOT) {
      if (wallets.first) {
        const firstWallet: Wallet = wallets.first;

        // Dynamic Initialization of Topbar Categories
        this.stores.topbar.initCategories();

        this.actions.router.goToRoute.trigger({
          route: ROUTES.WALLETS.TRANSACTIONS,
          params: { id: firstWallet.id }
        });
      } else {
        this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
      }
    }
  }
}

export class UnableToLoadError extends LocalizableError {
  constructor() {
    super({
      id: 'app.errors.unableToLoad',
      defaultMessage: '!!!Unable to load',
    });
  }
}
