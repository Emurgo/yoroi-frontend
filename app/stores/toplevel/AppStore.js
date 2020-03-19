// @flow
import { computed } from 'mobx';
import Store from '../base/Store';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';

export default class AppStore extends Store {

  setup(): void {
    super.setup();
    this.actions.router.goToRoute.listen(this._updateRouteLocation);
    this.actions.router.goToTransactionsList.listen(this._setRouteLocationToTransactionsList);
  }

  @computed get currentRoute(): string {
    return this.stores.router.location.pathname;
  }

  _updateRouteLocation: {| route: string, params: ?Object, forceRefresh?: boolean |} => void = (
    options
  ) => {
    const routePath = buildRoute(options.route, options.params);
    const currentRoute = this.stores.router.location.pathname;
    if (currentRoute !== routePath || options.forceRefresh === true) {
      if (options.forceRefresh === true) {
        // react-router doesn't support forcing reload if the path is the same
        // so we instead push a unique path (to guarantee a refresh) then replace with the real path
        this.stores.router.push({ pathname: ROUTES.WALLETS.SWITCH });
        // note: we replace instead of pushing a new path to avoid breaking the back button
        // we need the timeout otherwise mobx will optimize out the fake path
        setTimeout(() => {
          this.stores.router.replace({ pathname: routePath });
        });
      } else {
        this.stores.router.push(routePath);
      }
    }
  };

  _setRouteLocationToTransactionsList: {| params: ?Object |} => void = (
    options
  ) => {
    const routePath = buildRoute(ROUTES.WALLETS.TRANSACTIONS, options.params);
    const currentRoute = this.stores.router.location.pathname;
    if (currentRoute !== routePath) this.stores.router.push(routePath);
  };
}
