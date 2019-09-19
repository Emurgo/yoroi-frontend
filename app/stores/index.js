// @flow
import { observable, action } from 'mobx';
import AppStore from './toplevel/AppStore';
import ProfileStore from './toplevel/ProfileStore';
import WalletBackupStore from './toplevel/WalletBackupStore';
import TopbarStore from './toplevel/TopbarStore';
import UiDialogsStore from './toplevel/UiDialogsStore';
import UiNotificationsStore from './toplevel/UiNotificationsStore';
import LoadingStore from './toplevel/LoadingStore';
import MemosStore from './toplevel/MemosStore';
import setupAdaStores from './ada/index';
import type { AdaStoresMap } from './ada/index';
import environment from '../environment';
import { RouterStore } from 'mobx-react-router';
import type { ActionsMap } from '../actions/index';
import type { Api } from '../api/index';

/** Map of var name to class. Allows dyanmic lookup of class so we can init all stores one loop */
const storeClasses = {
  profile: ProfileStore,
  app: AppStore,
  topbar: TopbarStore,
  memos: MemosStore,
  walletBackup: WalletBackupStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  loading: LoadingStore,
};

export type StoresMap = {
  profile: ProfileStore,
  app: AppStore,
  topbar: TopbarStore,
  memos: MemosStore,
  walletBackup: WalletBackupStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  loading: LoadingStore,
  substores: { ada: AdaStoresMap },
  router: RouterStore,
};

/** Constant that represents the stores across the lifetime of the application */
const stores = observable({
  profile: null,
  theme: null,
  app: null,
  topbar: null,
  memos: null,
  walletBackup: null,
  uiDialogs: null,
  uiNotifications: null,
  loading: null,
  substores: {},
  router: null,
});

/** Set up and return the stores for this app -> also used to reset all stores to defaults */
export default action(
  (
    api: Api,
    actions: ActionsMap,
    router: RouterStore
  ): StoresMap => {
    /** Note: `stores` sets all values to null to start
     * However this is incompatible with the `StoresMap` types
     * We don't make `StoresMap` fields optional as it would bloat the code with nullchecks
     * We need to keep `stores` null to
     * - keep the global reference alive
     * - allow resetting the stores
     * - allow passing the incomplete `stores` type down to toplevel stores
     *
     * Therefore, we instead typecast to `any` so Flow doesn't complain about this hack */

    // Assign mobx-react-router only once
    if (stores.router == null) stores.router = router;
    // All other stores have our lifecycle
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
    stores.substores.ada = setupAdaStores(stores, api, actions);
    if (environment.API === 'ada') {
      Object
        .keys(stores.substores.ada)
        .map(key => stores.substores.ada[key])
        .forEach(store => store.initialize());
    }

    // Perform load after all setup is done to ensure migration can modify store state
    if (stores.loading) { // if condition to please flow (avoid thinkin "loading" is null)
      stores.loading.load();
    }

    return (stores: any);
  }
);
