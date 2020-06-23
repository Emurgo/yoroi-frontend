// @flow
import { computed } from 'mobx';
import Store from '../base/Store';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class AppStore extends Store {

  setup(): void {
    super.setup();
    this.actions.router.goToRoute.listen(this._updateRouteLocation);
    this.actions.router.redirect.listen(this._redirect);
    this.actions.router.goToTransactionsList.listen(this._setRouteLocationToTransactionsList);
  }

  @computed get currentRoute(): string {
    return this.stores.router.location.pathname;
  }

  _redirect: {|
    route: string,
    params: ?Object,
  |} => void = (
    options
  ) => {
    const routePath = buildRoute(options.route, options.params);
    this.stores.router.replace(routePath);
  };

  _updateRouteLocation: {|
    route: string,
    params: ?Object,
    publicDeriver?: null | PublicDeriver<>,
  |} => void = (
    options
  ) => {
    const routePath = buildRoute(options.route, options.params);
    const currentRoute = this.stores.router.location.pathname;
    if (
      options.publicDeriver !== undefined &&
      options.publicDeriver !== this.stores.wallets.selected
    ) {
      if (options.publicDeriver == null) {
        this.actions.wallets.unselectWallet.trigger();
      } else {
        this.actions.wallets.setActiveWallet.trigger({ wallet: options.publicDeriver });
      }
      // we can't clear the browser history programmatically (requires root privilege)
      // so instead, we route the user to a page that blocks the back button
      this.stores.router.push({ pathname: ROUTES.WALLETS.SWITCH });
      // we need the timeout otherwise mobx will optimize out the fake path
      setTimeout(() => {
        this.stores.router.push({ pathname: routePath });
      });
    } else if (currentRoute !== routePath) {
      this.stores.router.push(routePath);
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
