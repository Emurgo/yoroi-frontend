// @flow
import { observable, action } from 'mobx';
import ProfileStore from './toplevel/ProfileStore';
import type { Api } from '../../api/index';
import UiNotificationsStore from '../../stores/toplevel/UiNotificationsStore';
import UiDialogsStore from '../../stores/toplevel/UiDialogsStore';
import ConnectorStore from './ConnectorStore';
import ActionsMap from '../actions';

/** Map of var name to class. Allows dynamic lookup of class so we can init all stores one loop */
const storeClasses = Object.freeze({
  profile: ProfileStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  connector: ConnectorStore,
});

export type StoresMap = {|
  profile: ProfileStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  connector: ConnectorStore,
|};

/** Constant that represents the stores across the lifetime of the application */
const stores: WithNullableFields<StoresMap> = observable({
  profile: null,
  uiDialogs: null,
  uiNotifications: null,
  connector: null,
});

export default (action(
  (
    api: Api,
    // $FlowFixMe[value-as-type]
    actions: ActionsMap
  ): StoresMap => {
    const storeNames = Object.keys(storeClasses);
    storeNames.forEach(name => {
      if (stores[name]) stores[name].teardown();
    });
    storeNames.forEach(name => {
      stores[name] = (new storeClasses[name]((stores: any), api, actions): any);
    });
    storeNames.forEach(name => {
      if (stores[name]) stores[name].initialize();
    });

    const loadedStores: StoresMap = (stores: any);
    // loadedStores.loading.load();

    return loadedStores;
  }
  // $FlowFixMe[value-as-type]
): (Api, ActionsMap) => StoresMap);
