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

  _updateRouteLocation: {| route: string, params: ?Object |} => void = (
    options
  ) => {
    const routePath = buildRoute(options.route, options.params);
    const currentRoute = this.stores.router.location.pathname;
    if (currentRoute !== routePath) this.stores.router.push(routePath);
  };

  _setRouteLocationToTransactionsList: {| params: ?Object |} => void = (
    options
  ) => {
    const routePath = buildRoute(ROUTES.WALLETS.TRANSACTIONS, options.params);
    const currentRoute = this.stores.router.location.pathname;
    if (currentRoute !== routePath) this.stores.router.push(routePath);
  };
}
