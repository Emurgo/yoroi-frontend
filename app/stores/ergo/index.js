// @flow

// File is based the same pattern used for the non-ergo-specific stores in our app.

import { observable, action } from 'mobx';
import type { ActionsMap } from '../../actions/index';
import type { Api } from '../../api/index';
import type { StoresMap } from '../index';
import ErgoRestoreStore from './ErgoRestoreStore';
import ErgoWalletsStore from './ErgoWalletsStore';
import ErgoTransactionsStore from './ErgoTransactionsStore';
import ErgoAddressesStore from './ErgoAddressesStore';
import ErgoTimeStore from './ErgoTimeStore';

export const ergoStoreClasses = Object.freeze({
  addresses: ErgoAddressesStore,
  transactions: ErgoTransactionsStore,
  wallets: ErgoWalletsStore,
  walletRestore: ErgoRestoreStore,
  time: ErgoTimeStore,
});

export type ErgoStoresMap = {|
  addresses: ErgoAddressesStore,
  transactions: ErgoTransactionsStore,
  wallets: ErgoWalletsStore,
  walletRestore: ErgoRestoreStore,
  time: ErgoTimeStore,
|};

const ergoStores: WithNullableFields<ErgoStoresMap> = observable({
  addresses: null,
  transactions: null,
  wallets: null,
  walletRestore: null,
  time: null,
});

/** See `stores` index for description of this weird behavior
 * Note: stores created here are NOT initialized
 */
export default (action(
  (
    stores: StoresMap,
    api: Api,
    actions: ActionsMap,
  ): ErgoStoresMap => {
    const storeNames: Array<$Keys<typeof ergoStoreClasses>> = Object.keys(ergoStoreClasses);
    storeNames.forEach(name => { if (ergoStores[name]) ergoStores[name].teardown(); });
    storeNames.forEach(name => {
      ergoStores[name] = ((new ergoStoreClasses[name](stores, api, actions)): any);
    });
    return (ergoStores: any);
  }
): (StoresMap, Api, ActionsMap) => ErgoStoresMap);
