// @flow

// File is based the same pattern used for the non-ada-specific stores in our app.

import { observable, action } from 'mobx';
import AdaWalletsStore from './AdaWalletsStore';
import TransactionsStore from './AdaTransactionsStore';
import AdaWalletSettingsStore from './AdaWalletSettingsStore';
import AddressesStore from './AdaAddressesStore';
import DaedalusTransferStore from './DaedalusTransferStore';
import TrezorConnectStore from './TrezorConnectStore';
import TrezorSendStore from './TrezorSendStore';
import AdaRedemptionStore from './AdaRedemptionStore';
import LedgerConnectStore from './LedgerConnectStore';
import LedgerSendStore from './LedgerSendStore';
import HWVerifyAddressStore from './HWVerifyAddressStore';
import PaperWalletCreateStore from './PaperWalletCreateStore';
import StateFetchStore from './StateFetchStore';

export const adaStoreClasses = {
  adaRedemption: AdaRedemptionStore,
  wallets: AdaWalletsStore,
  paperWallets: PaperWalletCreateStore,
  transactions: TransactionsStore,
  walletSettings: AdaWalletSettingsStore,
  addresses: AddressesStore,
  daedalusTransfer: DaedalusTransferStore,
  trezorConnect: TrezorConnectStore,
  trezorSend: TrezorSendStore,
  ledgerConnect: LedgerConnectStore,
  ledgerSend: LedgerSendStore,
  hwVerifyAddress: HWVerifyAddressStore,
  stateFetchStore: StateFetchStore,
};

export type AdaStoresMap = {
  adaRedemption: AdaRedemptionStore,
  wallets: AdaWalletsStore,
  paperWallets: PaperWalletCreateStore,
  transactions: TransactionsStore,
  walletSettings: AdaWalletSettingsStore,
  addresses: AddressesStore,
  daedalusTransfer: DaedalusTransferStore,
  trezorConnect: TrezorConnectStore,
  trezorSend: TrezorSendStore,
  ledgerConnect: LedgerConnectStore,
  ledgerSend: LedgerSendStore,
  hwVerifyAddress: HWVerifyAddressStore,
  stateFetchStore: StateFetchStore,
};

const adaStores = observable({
  adaRedemption: null,
  wallets: null,
  paperWallets: null,
  transactions: null,
  walletSettings: null,
  addresses: null,
  daedalusTransfer: null,
  trezorConnect: null,
  trezorSend: null,
  ledgerConnect: null,
  ledgerSend: null,
  hwVerifyAddress: null,
  stateFetchStore: null,
});

/** See `stores` index for description of this weird behavior
 * Note: stores created here are NOT initialized
 */
export default action((stores, api, actions): AdaStoresMap => {
  const storeNames = Object.keys(adaStoreClasses);
  storeNames.forEach(name => { if (adaStores[name]) adaStores[name].teardown(); });
  storeNames.forEach(name => {
    adaStores[name] = ((new adaStoreClasses[name](stores, api, actions)): any);
  });
  return (adaStores: any);
});
