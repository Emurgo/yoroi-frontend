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
import WalletSettingsStore from './toplevel/WalletSettingsStore';
import TransactionsStore from './toplevel/TransactionsStore';
import AddressesStore from './toplevel/AddressesStore';
import TimeStore from './toplevel/TimeStore';
import WalletRestoreStore from './toplevel/WalletRestoreStore';
import setupAdaStores from './ada/index';
import setupErgoStores from './ergo/index';
import type { AdaStoresMap } from './ada/index';
import type { ErgoStoresMap } from './ergo/index';
import { RouterStore } from 'mobx-react-router';
import type { ActionsMap } from '../actions/index';
import type { Api } from '../api/index';
import { ApiOptions } from '../api/common/utils';
import StateFetchStore from './toplevel/StateFetchStore';
import CoinPriceStore from './toplevel/CoinPriceStore';
import ServerConnectionStore from './toplevel/ServerConnectionStore';

/** Map of var name to class. Allows dynamic lookup of class so we can init all stores one loop */
const storeClasses = Object.freeze({
  stateFetchStore: StateFetchStore,
  coinPriceStore: CoinPriceStore,
  profile: ProfileStore,
  serverConnectionStore: ServerConnectionStore,
  app: AppStore,
  topbar: TopbarStore,
  memos: MemosStore,
  walletBackup: WalletBackupStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  noticeBoard: NoticeBoardStore,
  loading: LoadingStore,
  wallets: WalletStore,
  addresses: AddressesStore,
  time: TimeStore,
  transactions: TransactionsStore,
  walletRestore: WalletRestoreStore,
  walletSettings: WalletSettingsStore,
  // note: purposely exclude substores and router
});

export type StoresMap = {|
  stateFetchStore: StateFetchStore,
  coinPriceStore: CoinPriceStore,
  profile: ProfileStore,
  serverConnectionStore: ServerConnectionStore,
  app: AppStore,
  topbar: TopbarStore,
  memos: MemosStore,
  walletBackup: WalletBackupStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  noticeBoard: NoticeBoardStore,
  loading: LoadingStore,
  wallets: WalletStore,
  addresses: AddressesStore,
  time: TimeStore,
  transactions: TransactionsStore,
  walletRestore: WalletRestoreStore,
  walletSettings: WalletSettingsStore,
  substores: {| ada: AdaStoresMap, ergo: ErgoStoresMap, |},
  router: RouterStore,
|};

/** Constant that represents the stores across the lifetime of the application */
const stores: WithNullableFields<StoresMap> = observable({
  stateFetchStore: null, // best to initialize first to avoid issues
  coinPriceStore: null,
  profile: null,
  serverConnectionStore: null,
  app: null,
  topbar: null,
  memos: null,
  walletBackup: null,
  uiDialogs: null,
  uiNotifications: null,
  noticeBoard: null,
  loading: null,
  wallets: null,
  addresses: null,
  time: null,
  transactions: null,
  walletRestore: null,
  walletSettings: null,
  substores: null,
  router: null,
});

function initializeSubstore<T: {...}>(
  substore: T,
): void {
  Object
    .keys(substore)
    .map(key => substore[key])
    .forEach(store => store.initialize());
}

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
      ada: setupAdaStores((stores: any), api, actions),
      ergo: setupErgoStores((stores: any), api, actions),
    };

    const loadedStores: StoresMap = (stores: any);
    initializeSubstore<ErgoStoresMap>(loadedStores.substores[ApiOptions.ergo]);
    initializeSubstore<AdaStoresMap>(loadedStores.substores[ApiOptions.ada]);

    // Perform load after all setup is done to ensure migration can modify store state
    loadedStores.loading.load();

    return loadedStores;
  }
): (Api, ActionsMap, RouterStore) => StoresMap);
