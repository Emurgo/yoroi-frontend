// @flow
import { computed } from 'mobx';
import Store from '../base/Store';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export default class AppStore extends Store<StoresMap, ActionsMap> {

  setup(): void {
    super.setup();
    this.actions.router.goToRoute.listen(this._updateRouteLocation);
    this.actions.router.redirect.listen(this._redirect);
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
    publicDeriverId?: null | number,
  |} => void = (
    options
  ) => {
    const routePath = buildRoute(options.route, options.params);
    const currentRoute = this.stores.router.location.pathname;
    if (
      options.publicDeriverId !== undefined &&
      options.publicDeriverId !== this.stores.wallets.selected?.publicDeriverId
    ) {
      if (options.publicDeriverId == null) {
        this.actions.wallets.unselectWallet.trigger();
      } else {
        this.actions.wallets.setActiveWallet.trigger({ publicDeriverId: options.publicDeriverId });
      }
      // we can't clear the browser history programmatically (requires root privilege)
      // so instead, we route the user to a page that blocks the back button
      this.stores.router.push({ pathname: ROUTES.SWITCH });
      // we need the timeout otherwise mobx will optimize out the fake path
      setTimeout(() => {
        this.stores.router.push({ pathname: routePath });
      });
    } else if (currentRoute !== routePath) {
      this.stores.router.push(routePath);
    }
  };
}
