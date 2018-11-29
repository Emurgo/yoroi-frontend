// @flow

// File is based the same pattern used for the non-ada-specific stores in our app.

import { observable, action } from 'mobx';
import AdaWalletsStore from './AdaWalletsStore';
import TransactionsStore from './AdaTransactionsStore';
import AdaWalletSettingsStore from './AdaWalletSettingsStore';
import AddressesStore from './AdaAddressesStore';
import DaedalusTransferStore from './DaedalusTransferStore';
import TrezorConnectStore from './TrezorConnectStore';
import TrezorStore from './TrezorStore';

export const adaStoreClasses = {
  wallets: AdaWalletsStore,
  transactions: TransactionsStore,
  walletSettings: AdaWalletSettingsStore,
  addresses: AddressesStore,
  daedalusTransfer: DaedalusTransferStore,
  trezorConnect: TrezorConnectStore,
  trezor: TrezorStore
};

export type AdaStoresMap = {
  wallets: AdaWalletsStore,
  transactions: TransactionsStore,
  walletSettings: AdaWalletSettingsStore,
  addresses: AddressesStore,
  daedalusTransfer: DaedalusTransferStore,
  trezorConnect: TrezorConnectStore,
  trezor: TrezorStore,
};

const adaStores = observable({
  wallets: null,
  transactions: null,
  walletSettings: null,
  addresses: null,
  daedalusTransfer: null,
  trezorConnect: null,
  trezor: null,
});

/** Set up and return the stores and reset all stores to defaults */
export default action((stores, api, actions): AdaStoresMap => {
  const storeNames = Object.keys(adaStoreClasses);
  storeNames.forEach(name => { if (adaStores[name]) adaStores[name].teardown(); });
  storeNames.forEach(name => {
    adaStores[name] = new adaStoreClasses[name](stores, api, actions);
  });
  storeNames.forEach(name => { if (adaStores[name]) adaStores[name].initialize(); });
  return adaStores;
});
