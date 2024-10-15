// @flow
import { observable, action } from 'mobx';
import AppStore from './toplevel/AppStore';
import ProfileStore from './toplevel/ProfileStore';
import WalletBackupStore from './toplevel/WalletBackupStore';
import UiDialogsStore from './toplevel/UiDialogsStore';
import UiNotificationsStore from './toplevel/UiNotificationsStore';
import LoadingStore from './toplevel/LoadingStore';
import MemosStore from './toplevel/MemosStore';
import WalletStore from './toplevel/WalletStore';
import WalletSettingsStore from './toplevel/WalletSettingsStore';
import TransactionsStore from './toplevel/TransactionsStore';
import AddressesStore from './toplevel/AddressesStore';
import WalletRestoreStore from './toplevel/WalletRestoreStore';
import YoroiTransferStore from './toplevel/YoroiTransferStore';
import TransactionBuilderStore from './toplevel/TransactionBuilderStore';
import DelegationStore from './toplevel/DelegationStore';
import setupAdaStores from './ada/index';
import type { AdaStoresMap } from './ada/index';
import { RouterStore } from 'mobx-react-router';
import type { ActionsMap } from '../actions/index';
import type { Api } from '../api/index';
import StateFetchStore from './toplevel/StateFetchStore';
import CoinPriceStore from './toplevel/CoinPriceStore';
import TokenInfoStore from './toplevel/TokenInfoStore';
import ExplorerStore from './toplevel/ExplorerStore';
import ServerConnectionStore from './toplevel/ServerConnectionStore';
import ConnectorStore from './toplevel/DappConnectorStore'
import ProtocolParametersStore from './toplevel/ProtocolParametersStore';

/** Map of var name to class. Allows dynamic lookup of class so we can init all stores one loop */
const storeClasses = Object.freeze({
  stateFetchStore: StateFetchStore,
  coinPriceStore: CoinPriceStore,
  tokenInfoStore: TokenInfoStore,
  profile: ProfileStore,
  serverConnectionStore: ServerConnectionStore,
  app: AppStore,
  memos: MemosStore,
  walletBackup: WalletBackupStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  loading: LoadingStore,
  wallets: WalletStore,
  addresses: AddressesStore,
  transactions: TransactionsStore,
  walletRestore: WalletRestoreStore,
  walletSettings: WalletSettingsStore,
  transactionBuilderStore: TransactionBuilderStore,
  delegation: DelegationStore,
  yoroiTransfer: YoroiTransferStore,
  explorers: ExplorerStore,
  connector: ConnectorStore,
  protocolParameters: ProtocolParametersStore,
  // note: purposely exclude substores and router
});

export type StoresMap = {|
  stateFetchStore: StateFetchStore<StoresMap, ActionsMap>,
  coinPriceStore: CoinPriceStore,
  tokenInfoStore: TokenInfoStore<StoresMap>,
  profile: ProfileStore,
  serverConnectionStore: ServerConnectionStore,
  app: AppStore,
  memos: MemosStore,
  walletBackup: WalletBackupStore,
  uiDialogs: UiDialogsStore<{||}>,
  uiNotifications: UiNotificationsStore<{||}>,
  loading: LoadingStore,
  wallets: WalletStore,
  addresses: AddressesStore,
  transactions: TransactionsStore,
  walletRestore: WalletRestoreStore,
  walletSettings: WalletSettingsStore,
  transactionBuilderStore: TransactionBuilderStore,
  delegation: DelegationStore,
  yoroiTransfer: YoroiTransferStore,
  explorers: ExplorerStore,
  connector: ConnectorStore,
  substores: {|
    ada: AdaStoresMap,
  |},
  // $FlowFixMe[value-as-type]
  router: RouterStore,
  protocolParameters: ProtocolParametersStore<StoresMap>,
|};

/** Constant that represents the stores across the lifetime of the application */
// Note: initially we assign a map of all-null values which violates the type (thus
// the cast to `any`), but as soon as the below set-up code is executed, the object
// becomes conformant to the type.
const stores: StoresMap = (observable({
  stateFetchStore: null, // best to initialize first to avoid issues
  coinPriceStore: null,
  tokenInfoStore: null,
  profile: null,
  serverConnectionStore: null,
  app: null,
  sidebar: null,
  memos: null,
  walletBackup: null,
  uiDialogs: null,
  uiNotifications: null,
  loading: null,
  wallets: null,
  addresses: null,
  transactions: null,
  walletRestore: null,
  walletSettings: null,
  transactionBuilderStore: null,
  delegation: null,
  daedalusTransfer: null,
  yoroiTransfer: null,
  explorers: null,
  substores: null,
  router: null,
  connector: null,
  protocolParameters: null,
}): any);

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
  async (
    api: Api,
    actions: ActionsMap,
    // $FlowFixMe[value-as-type]
    router: RouterStore
  ): Promise<StoresMap> => {
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
      stores[name] = ((new storeClasses[name](stores, api, actions)): any);
    });
    storeNames.forEach(name => { if (stores[name]) stores[name].initialize(); });

    /** Add currency specific stores
     * Note: we have to split up th setup and the initialization
     * Because to make sure all substores are non-null we have to create the object
     * But we only want to actually initialize it if it is the currency in use */
    stores.substores = {
      ada: setupAdaStores((stores: any), api, actions),
    };

    const loadedStores: StoresMap = (stores: any);
    initializeSubstore<AdaStoresMap>(loadedStores.substores.ada);

    // Perform load after all setup is done to ensure migration can modify store state
    await loadedStores.loading.load()
      .then(() => console.debug('extension / loading store loaded'))
      .catch(e => console.error('extension / loading store load failed', e));

    return loadedStores;
  }
  // $FlowFixMe[value-as-type]
): (Api, ActionsMap, RouterStore) => StoresMap);
