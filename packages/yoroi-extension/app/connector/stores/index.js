// @flow
import { observable, action } from 'mobx';
import ProfileStore from './toplevel/ProfileStore';
import type { Api } from '../../api/index';
import UiNotificationsStore from '../../stores/toplevel/UiNotificationsStore';
import UiDialogsStore from '../../stores/toplevel/UiDialogsStore';
import ConnectorCoinPriceStore from './toplevel/ConnectorCoinPriceStore';
import TokenInfoStore from '../../stores/toplevel/TokenInfoStore';
import ConnectorStore from './ConnectorStore';
import ConnectorLoadingStore from './toplevel/ConnectorLoadingStore';
import type { ActionsMap } from '../actions';
import type { AdaStoresMap } from './ada/index';
import setupAdaStores from './ada/index';
import StateFetchStore from '../../stores/toplevel/StateFetchStore';
import ExplorerStore from './toplevel/ExplorerStore';

/** Map of var name to class. Allows dynamic lookup of class so we can init all stores one loop */
const storeClasses = Object.freeze({
  stateFetchStore: StateFetchStore,
  profile: ProfileStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  coinPriceStore: ConnectorCoinPriceStore,
  loading: ConnectorLoadingStore,
  connector: ConnectorStore,
  tokenInfoStore: TokenInfoStore,
  explorers: ExplorerStore,
});

export type StoresMap = {|
  stateFetchStore: StateFetchStore<StoresMap, ActionsMap>,
  profile: ProfileStore,
  uiDialogs: UiDialogsStore<{||}, ActionsMap>,
  uiNotifications: UiNotificationsStore<{||}, ActionsMap>,
  explorers: ExplorerStore,
  coinPriceStore: ConnectorCoinPriceStore,
  loading: ConnectorLoadingStore,
  connector: ConnectorStore,
  tokenInfoStore: TokenInfoStore<StoresMap>,
  substores: {|
    ada: AdaStoresMap,
  |},
|};

/** Constant that represents the stores across the lifetime of the application */
// Note: initially we assign a map of all-null values which violates the type (thus
// the cast to `any`), but as soon as the below set-up code is executed, the object
// becomes conformant to the type.
const stores: StoresMap = (observable({
  stateFetchStore: null, // best to initialize first to avoid issues
  profile: null,
  explorers: null,
  uiDialogs: null,
  uiNotifications: null,
  coinPriceStore: null,
  loading: null,
  connector: null,
  tokenInfoStore: null,
  substores: null,
}): any);

function initializeSubstore<T: {...}>(
  substore: T,
): void {
  Object
    .keys(substore)
    .map(key => substore[key])
    .forEach(store => store.initialize());
}

export default (action(
  (
    api: Api,
    actions: ActionsMap
  ): StoresMap => {
    const storeNames = Object.keys(storeClasses);
    storeNames.forEach(name => {
      if (stores[name]) stores[name].teardown();
    });
    storeNames.forEach(name => {
      stores[name] = (new storeClasses[name](stores, api, actions): any);
    });
    storeNames.forEach(name => {
      if (stores[name]) stores[name].initialize();
    });

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
    loadedStores.loading.load()
      .then(() => console.debug('connector / loading store loaded'))
      .catch(e => console.error('connector / loading store load failed', e));

    return loadedStores;
  }
): (Api, ActionsMap) => StoresMap);
