// @flow
import { observable, computed, when, runInAction } from 'mobx';
import { loadRustModule } from 'rust-cardano-crypto';
import { loadLovefieldDB } from '../api/ada/lib/lovefieldDatabase';
import Store from './lib/Store';
import environment from '../environment';
import { ROUTES } from '../routes-config';
import LocalizableError, {
  localizedError
} from '../i18n/LocalizableError';


export default class LoadingStore extends Store {

  @observable error: ?LocalizableError = null;
  @observable _loading: boolean = true;

  setup() {
    when(this._isRefresh, this._redirectToLoading);
    Promise.all([loadRustModule(), loadLovefieldDB()])
    .then(async () => {
      await this._whenLibrariesReady();
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

  _isRefresh = () => this.isLoading;

  _redirectToLoading = () =>
    this.actions.router.goToRoute.trigger({ route: ROUTES.ROOT });

  _whenLibrariesReady = async () => {
    const { app } = this.stores;
    const { wallets } = this.stores[environment.API];
    await wallets.refreshWalletsData();
    if (app.currentRoute === ROUTES.ROOT) {
      if (wallets.first) {
        this.actions.router.goToRoute.trigger({
          route: ROUTES.WALLETS.SUMMARY,
          params: { id: wallets.first.id }
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
