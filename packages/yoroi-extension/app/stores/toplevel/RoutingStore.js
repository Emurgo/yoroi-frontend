// @flow
import Store from '../base/Store';
import type { StoresMap } from '../index';
import { buildRoute } from '../../utils/routing';
import { redirect, replace } from 'react-router';
import { observable } from 'mobx';

export default class RoutingStore extends Store<StoresMap> {
  @observable currentRoute: string;

  replaceRoute: ({|
    route: string,
    params?: Object,
  |}) => void = options => {
    const routePath = buildRoute(options.route, options.params);
    replace(routePath);
  };

  goToRoute: ({|
    route: string,
    params?: Object,
    delegateToYoroiDrep?: null | boolean,
  |}) => void = options => {
    const routePath = buildRoute(options.route, options.params);

    if (typeof options.delegateToYoroiDrep !== 'undefined') {
      window.history.pushState({ delegateToYoroiDrep: options.delegateToYoroiDrep }, '', routePath);
    } else {
      redirect(routePath);
    }
  }
}
