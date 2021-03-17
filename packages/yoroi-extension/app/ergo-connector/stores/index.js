// @flow
import { observable, action } from 'mobx';
import ProfileStore from './toplevel/ProfileStore';
import type { Api } from '../../api/index';
import UiNotificationsStore from '../../stores/toplevel/UiNotificationsStore';
import UiDialogsStore from '../../stores/toplevel/UiDialogsStore';
import CoinPriceStore from '../../stores/toplevel/CoinPriceStore';
import ConnectorStore from './ConnectorStore';
import ConnectorLoadingStore from './ConnectorLoadingStore';
import type { ActionsMap } from '../actions';

/** Map of var name to class. Allows dynamic lookup of class so we can init all stores one loop */
const storeClasses = Object.freeze({
  profile: ProfileStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  coinPriceStore: CoinPriceStore,
  loading: ConnectorLoadingStore,
  connector: ConnectorStore,
});

export type StoresMap = {|
  profile: ProfileStore,
  uiDialogs: UiDialogsStore<{||}, ActionsMap>,
  uiNotifications: UiNotificationsStore<{||}, ActionsMap>,
  coinPriceStore: CoinPriceStore,
  loading: ConnectorLoadingStore,
  connector: ConnectorStore,
|};

/** Constant that represents the stores across the lifetime of the application */
const stores: WithNullableFields<StoresMap> = observable({
  profile: null,
  uiDialogs: null,
  uiNotifications: null,
  coinPriceStore: null,
  loading: null,
  connector: null,
});

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
      stores[name] = (new storeClasses[name]((stores: any), api, (actions: any)): any);
    });
    storeNames.forEach(name => {
      if (stores[name]) stores[name].initialize();
    });

    const loadedStores: StoresMap = (stores: any);

    // Perform load after all setup is done to ensure migration can modify store state
    loadedStores.loading.load();

    return loadedStores;
  }
): (Api, ActionsMap) => StoresMap);
