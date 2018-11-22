// @flow
import { observable, action } from 'mobx';
import AppStore from './toplevel/AppStore';
import ProfileStore from './toplevel/ProfileStore';
import WalletBackupStore from './toplevel/WalletBackupStore';
import SidebarStore from './toplevel/SidebarStore';
import UiDialogsStore from './toplevel/UiDialogsStore';
import UiNotificationsStore from './toplevel/UiNotificationsStore';
import LoadingStore from './toplevel/LoadingStore';
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
  sidebar: SidebarStore,
  walletBackup: WalletBackupStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  loading: LoadingStore,
};

export type StoresMap = {
  profile: ProfileStore,
  app: AppStore,
  sidebar: SidebarStore,
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
  app: null,
  sidebar: null,
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
    // Assign mobx-react-router only once
    if (stores.router == null) stores.router = router;
    // All other stores have our lifecycle
    const storeNames = Object.keys(storeClasses);
    storeNames.forEach(name => { if (stores[name]) stores[name].teardown(); });
    storeNames.forEach(name => { stores[name] = new storeClasses[name](stores, api, actions); });
    storeNames.forEach(name => { if (stores[name]) stores[name].initialize(); });

    // Add currency specific stores
    if (environment.API === 'ada') stores.substores.ada = setupAdaStores(stores, api, actions);

    return stores;
  }
);
