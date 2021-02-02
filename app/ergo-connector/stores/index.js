// @flow
import { observable,action  } from 'mobx';
import ProfileStore from './toplevel/ProfileStore';
import type { Api } from '../../api/index';
import type { ActionsMap } from '../../actions/index';

/** Map of var name to class. Allows dynamic lookup of class so we can init all stores one loop */
const storeClasses = Object.freeze({
  profile: ProfileStore,
});

export type StoresMap = {|
  profile: ProfileStore,
|};

/** Constant that represents the stores across the lifetime of the application */
const stores: WithNullableFields<StoresMap> = observable({
  profile: null,
  serverConnectionStore: null,
  app: null,
  sidebar: null,
  loading: null,
});



/** Set up and return the stores for this app -> also used to reset all stores to defaults */
export default (action(
  (
    api: Api,
    actions: ActionsMap,
  ): StoresMap => {
    /** Note: `stores` sets all values to null to start
     * However this is incompatible with the `StoresMap` types
     * We don't make `StoresMap` fields optional as it would bloat the code with null checks
     * We need to keep `stores` null to
     * - keep the global reference alive
     * - allow resetting the stores
     * - allow passing the incomplete `stores` type down to toplevel stores
     *
     * Therefore, we instead typecast to `any` so Flow doesn't complain about this hack */

    const storeNames = Object.keys(storeClasses);
    storeNames.forEach(name => { if (stores[name]) stores[name].teardown(); });
    storeNames.forEach(name => {
      // Careful: we pass incomplete `store` down to child components
      // Any toplevel store that accesses `store` in its constructor may crash
      stores[name] = ((new storeClasses[name]((stores: any), api, actions)): any);
    });
    storeNames.forEach(name => { if (stores[name]) stores[name].initialize(); });

    /** Add currency specific stores
     * Note: we have to split up th setup and the initialization
     * Because to make sure all substores are non-null we have to create the object
     * But we only want to actually initialize it if it is the currency in use */

    const loadedStores: StoresMap = (stores: any);

    return loadedStores;
  }
  // $FlowFixMe[value-as-type]
): (Api, ActionsMap) => StoresMap);
