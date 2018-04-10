// @flow
import { observable, action } from 'mobx';
import AdaWalletsStore from './AdaWalletsStore';
import TransactionsStore from './AdaTransactionsStore';

export const adaStoreClasses = {
  wallets: AdaWalletsStore,
  transactions: TransactionsStore,
};

export type AdaStoresMap = {
  wallets: AdaWalletsStore,
  transactions: TransactionsStore,
};

const adaStores = observable({
  wallets: null,
  transactions: null,
  addresses: []
});

// Set up and return the stores and reset all stores to defaults
export default action((stores, api, actions): AdaStoresMap => {
  const storeNames = Object.keys(adaStoreClasses);
  storeNames.forEach(name => { if (adaStores[name]) adaStores[name].teardown(); });
  storeNames.forEach(name => {
    adaStores[name] = new adaStoreClasses[name](stores, api, actions);
  });
  storeNames.forEach(name => { if (adaStores[name]) adaStores[name].initialize(); });
  return adaStores;
});
