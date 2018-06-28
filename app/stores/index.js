// @flow
import { observable, action } from 'mobx';
import AppStore from './AppStore';
import ProfileStore from './ProfileStore';
import WalletBackupStore from './WalletBackupStore';
import SidebarStore from './SidebarStore';
import UiDialogsStore from './UiDialogsStore';
import UiNotificationsStore from './UiNotificationsStore';
import setupAdaStores from './ada/index';
import type { AdaStoresMap } from './ada/index';
import environment from '../environment';

export const storeClasses = {
  profile: ProfileStore,
  app: AppStore,
  sidebar: SidebarStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  walletBackup: WalletBackupStore,
};

export type StoresMap = {
  profile: ProfileStore,
  app: AppStore,
  sidebar: SidebarStore,
  walletBackup: WalletBackupStore,
  router: Object,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  ada: AdaStoresMap,
};

// Constant that does never change during lifetime
const stores = observable({
  profile: null,
  app: null,
  sidebar: null,
  walletBackup: null,
  router: null,
  uiDialogs: null,
  uiNotifications: null,
  ada: null,
});

// Set up and return the stores for this app -> also used to reset all stores to defaults
export default action((api, actions, router): StoresMap => {
  // Assign mobx-react-router only once
  if (stores.router == null) stores.router = router;
  // All other stores have our lifecycle
  const storeNames = Object.keys(storeClasses);
  storeNames.forEach(name => { if (stores[name]) stores[name].teardown(); });
  storeNames.forEach(name => { stores[name] = new storeClasses[name](stores, api, actions); });
  storeNames.forEach(name => { if (stores[name]) stores[name].initialize(); });

  // Add currency specific stores
  if (environment.API === 'ada') stores.ada = setupAdaStores(stores, api, actions);

  return stores;
});
