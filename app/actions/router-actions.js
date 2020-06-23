// @flow
import { Action } from './lib/Action';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver/index';

// ======= ROUTER ACTIONS =======

export default class RouterActions {
  goToRoute: Action<{|
    route: string,
    params?: ?Object,
    publicDeriver?: null | PublicDeriver<>,
  |}> = new Action();
  redirect: Action<{|
    route: string,
    params?: ?Object,
  |}> = new Action();

  goToTransactionsList: Action<{| params?: ?Object |}> = new Action();
}
