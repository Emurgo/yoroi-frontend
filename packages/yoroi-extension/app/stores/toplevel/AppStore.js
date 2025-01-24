// @flow
import { computed } from 'mobx';
import Store from '../base/Store';
import { buildRoute } from '../../utils/routing';
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
  |} => void = (
    options
  ) => {
    const routePath = buildRoute(options.route, options.params);
    const currentRoute = this.stores.router.location.pathname;
    if (currentRoute !== routePath) {
      this.stores.router.push(routePath);
    }
  };
}
