// @flow

// File is based the same pattern used for the non-ergo-specific stores in our app.

import { observable, action } from 'mobx';
import type { ActionsMap } from '../../actions/index';
import type { Api } from '../../../api/index';
import type { StoresMap } from '../index';
import ErgoStateFetchStore from '../../../stores/ergo/ErgoStateFetchStore';

export const ergoStoreClasses = Object.freeze({
  stateFetchStore: ErgoStateFetchStore,
});

export type ErgoStoresMap = {|
  stateFetchStore: ErgoStateFetchStore<StoresMap, ActionsMap>,
|};

const ergoStores: WithNullableFields<ErgoStoresMap> = observable({
  stateFetchStore: null,
});

/** See `stores` index for description of this weird behavior
 * Note: stores created here are NOT initialized
 */
export default (action(
  (
    stores: StoresMap,
    api: Api,
    actions: ActionsMap,
  ): ErgoStoresMap => {
    const storeNames: Array<$Keys<typeof ergoStoreClasses>> = Object.keys(ergoStoreClasses);
    storeNames.forEach(name => { if (ergoStores[name]) ergoStores[name].teardown(); });
    storeNames.forEach(name => {
      ergoStores[name] = ((new ergoStoreClasses[name](stores, api, actions)): any);
    });
    return (ergoStores: any);
  }
): (StoresMap, Api, ActionsMap) => ErgoStoresMap);
