// @flow
import { Action } from './lib/Action';

// ======= ROUTER ACTIONS =======

export default class RouterActions {
  goToRoute: Action<{|
    route: string,
    params?: ?Object,
    /** react-router doesn't refresh the page if you go to the URL you are already on */
    forceRefresh?: boolean,
  |}> = new Action();

  goToTransactionsList: Action<{| params?: ?Object |}> = new Action();
}
