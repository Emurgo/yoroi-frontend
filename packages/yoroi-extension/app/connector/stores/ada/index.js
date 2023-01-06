// @flow

import { observable, action } from 'mobx';
import AdaStateFetchStore from '../../../stores/ada/AdaStateFetchStore';
import AdaAddressesStore from '../../../stores/ada/AdaAddressesStore';
import type { ActionsMap } from '../../actions/index';
import type { Api } from '../../../api/index';
import type { StoresMap } from '../index';

export const adaStoreClasses = Object.freeze({
  stateFetchStore: AdaStateFetchStore,
  addresses: AdaAddressesStore,
});

export type AdaStoresMap = {|
  stateFetchStore: AdaStateFetchStore<StoresMap, ActionsMap>,
  addresses: AdaAddressesStore,
|};

const adaStores: WithNullableFields<AdaStoresMap> = observable({
  stateFetchStore: null,
  addresses: null,
});

/** See `stores` index for description of this weird behavior
 * Note: stores created here are NOT initialized
 */
export default (action(
  (
    stores: StoresMap,
    api: Api,
    actions: ActionsMap,
  ): AdaStoresMap => {
    const storeNames: Array<$Keys<typeof adaStoreClasses>> = Object.keys(adaStoreClasses);
    storeNames.forEach(name => { if (adaStores[name]) adaStores[name].teardown(); });
    storeNames.forEach(name => {
      adaStores[name] = ((new adaStoreClasses[name](stores, api, actions)): any);
    });
    return (adaStores: any);
  }
): (StoresMap, Api, ActionsMap) => AdaStoresMap);
