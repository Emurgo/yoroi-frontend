// @flow
import { observable, computed, runInAction } from 'mobx';
import { loadRustModule } from 'rust-cardano-crypto';
import { loadLovefieldDB } from '../api/ada/lib/lovefieldDatabase';
import Store from './lib/Store';
import environment from '../environment';
import { ROUTES } from '../routes-config';
import LocalizableError from '../i18n/LocalizableError';

export default class AsyncLibrariesStore extends Store {

  @observable error: ?LocalizableError = null;
  @observable _loading: boolean = true;

  setup() {
    Promise.all([loadRustModule(), loadLovefieldDB()])
    .then(() => {
      runInAction(() => {
        this.error = null;
        this._loading = false;
      });
      this._whenLibrariesReady();
      return undefined;
    })
    .catch((error) => {
      console.error('AsyncLibrariesStore::setup Unable to load libraries', error);
      runInAction(() => {
        this.error = new UnableToLoadLibrariesError();
        this._loading = false;
      });
    });
  }

  @computed get loading(): boolean {
    return !!this._loading;
  }

  _whenLibrariesReady = () => {
    const { app } = this.stores;
    const { wallets } = this.stores[environment.API];
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

export class UnableToLoadLibrariesError extends LocalizableError {
  constructor() {
    super({
      id: 'asyncLibraries.error.unableToLoadLibraries',
      defaultMessage: '!!!Unable to load the libraries',
      description: '"Unable to load the libraries" error message'
    });
  }
}
