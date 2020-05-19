// @flow
import { observable, action } from 'mobx';
import AppStore from './toplevel/AppStore';
import ProfileStore from './toplevel/ProfileStore';
import WalletBackupStore from './toplevel/WalletBackupStore';
import TopbarStore from './toplevel/TopbarStore';
import UiDialogsStore from './toplevel/UiDialogsStore';
import UiNotificationsStore from './toplevel/UiNotificationsStore';
import NoticeBoardStore from './toplevel/NoticeBoardStore';
import LoadingStore from './toplevel/LoadingStore';
import MemosStore from './toplevel/MemosStore';
import WalletStore from './toplevel/WalletStore';
import setupAdaStores from './ada/index';
import type { AdaStoresMap } from './ada/index';
import environment from '../environment';
import { RouterStore } from 'mobx-react-router';
import type { ActionsMap } from '../actions/index';
import type { Api } from '../api/index';

/** Map of var name to class. Allows dynamic lookup of class so we can init all stores one loop */
const storeClasses = {
  profile: ProfileStore,
  app: AppStore,
  topbar: TopbarStore,
  memos: MemosStore,
  walletBackup: WalletBackupStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  noticeBoard: NoticeBoardStore,
  loading: LoadingStore,
  wallets: WalletStore,
  // note: purposely exclude substores and router
};

export type StoresMap = {|
  profile: ProfileStore,
  app: AppStore,
  topbar: TopbarStore,
  memos: MemosStore,
  walletBackup: WalletBackupStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  noticeBoard: NoticeBoardStore,
  loading: LoadingStore,
  wallets: WalletStore,
  substores: {| ada: AdaStoresMap, |},
  router: RouterStore,
|};

/** Constant that represents the stores across the lifetime of the application */
const stores: WithNullableFields<StoresMap> = observable({
  profile: null,
  app: null,
  topbar: null,
  memos: null,
  walletBackup: null,
  uiDialogs: null,
  uiNotifications: null,
  noticeBoard: null,
  loading: null,
  wallets: null,
  substores: null,
  router: null,
});

/** Set up and return the stores for this app -> also used to reset all stores to defaults */
export default (action(
  (
    api: Api,
    actions: ActionsMap,
    router: RouterStore
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
    stores.substores = {
      ada: setupAdaStores((stores: any), api, actions)
    };

    const loadedStores: StoresMap = (stores: any);
    if (environment.API === 'ada') {
      Object
        .keys(loadedStores.substores.ada)
        .map(key => loadedStores.substores.ada[key])
        .forEach(store => store.initialize());
    }

    // Perform load after all setup is done to ensure migration can modify store state
    loadedStores.loading.load();

    return loadedStores;
  }
): (Api, ActionsMap, RouterStore) => StoresMap);
