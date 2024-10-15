// @flow
import { computed } from 'mobx';
import Store from '../base/Store';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import type { StoresMap } from '../index';

export default class AppStore extends Store<StoresMap> {

  @computed get currentRoute(): string {
    return this.stores.router.location.pathname;
  }

  redirect: {|
    route: string,
    params?: Object,
  |} => void = (
    options
  ) => {
    const routePath = buildRoute(options.route, options.params);
    this.stores.router.replace(routePath);
  };

  goToRoute: {|
    route: string,
    params?: Object,
    publicDeriverId?: null | number,
  |} => void = (
    options
  ) => {
    const routePath = buildRoute(options.route, options.params);
    const { stores } = this;
    const currentRoute = stores.router.location.pathname;
    if (
      options.publicDeriverId !== undefined &&
      options.publicDeriverId !== stores.wallets.selected?.publicDeriverId
    ) {
      if (options.publicDeriverId == null) {
        stores.wallets.unsetActiveWallet();
      } else {
        stores.wallets.setActiveWallet({ publicDeriverId: options.publicDeriverId });
      }
      // we can't clear the browser history programmatically (requires root privilege)
      // so instead, we route the user to a page that blocks the back button
      stores.router.push({ pathname: ROUTES.SWITCH });
      // we need the timeout otherwise mobx will optimize out the fake path
      setTimeout(() => {
        stores.router.push({ pathname: routePath });
      });
    } else if (currentRoute !== routePath) {
      stores.router.push(routePath);
    }
  };
}
