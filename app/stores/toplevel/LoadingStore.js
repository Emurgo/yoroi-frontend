// @flow
import { observable, computed, when, runInAction } from 'mobx';
import { loadRustModule } from 'rust-cardano-crypto';
import { loadLovefieldDB } from '../../api/ada/lib/lovefieldDatabase';
import Store from '../base/Store';
import Wallet from '../../domain/Wallet';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import LocalizableError, {
  localizedError
} from '../../i18n/LocalizableError';

/** Load dependencies before launching the app */
export default class LoadingStore extends Store {

  @observable error: ?LocalizableError = null;
  @observable _loading: boolean = true;

  setup() {
    when(this._isRefresh, this._redirectToLoading);
    Promise.all([loadRustModule(), loadLovefieldDB()])
      .then(async () => {
        await this._openPageAfterLoad();
        runInAction(() => {
          this.error = null;
          this._loading = false;
        });
        return undefined;
      })
      .catch((error) => {
        console.error('LoadingStore::setup Unable to load libraries', error);
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
      description: '"Unable to load" error message'
    });
  }
}
