// @flow
import Store from '../base/Store';
import type { StoresMap } from '../index';
import { buildRoute } from '../../utils/routing';
import { redirect, replace } from 'react-router';
import { observable } from 'mobx';

export default class RoutingStore extends Store<StoresMap> {
  @observable currentRoute: string = '';
  navigate: Function;
  
  replaceRoute: ({|
    route: string,
    params?: Object,
  |}) => void = options => {
    const routePath = buildRoute(options.route, options.params);
    this.navigate(routePath, { replace: true });
  };

  goToRoute: ({|
    route: string,
    params?: Object,
    delegateToYoroiDrep?: null | boolean,
  |}) => void = options => {
    const routePath = buildRoute(options.route, options.params);

    if (this.navigate) {
      this.navigate(routePath);
    } else {
      window.history.pushState({ delegateToYoroiDrep: options.delegateToYoroiDrep }, '', '#' + routePath);
    }
  }
}
