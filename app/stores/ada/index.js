// @flow

// File is based the same pattern used for the non-ada-specific stores in our app.

import { observable, action } from 'mobx';
import AdaWalletsStore from './AdaWalletsStore';
import AdaTransactionsStore from './AdaTransactionsStore';
import AddressesStore from './AdaAddressesStore';
import AdaDaedalusTransferStore from './AdaDaedalusTransferStore';
import AdaYoroiTransferStore from './AdaYoroiTransferStore';
import TrezorConnectStore from './TrezorConnectStore';
import TrezorSendStore from './TrezorSendStore';
import AdaTransactionBuilderStore from './AdaTransactionBuilderStore';
import LedgerConnectStore from './LedgerConnectStore';
import LedgerSendStore from './LedgerSendStore';
import HWVerifyAddressStore from './HWVerifyAddressStore';
import PaperWalletCreateStore from './PaperWalletCreateStore';
import AdaStateFetchStore from './AdaStateFetchStore';
import AdaWalletRestoreStore from './AdaWalletRestoreStore';
import AdaTimeStore from './AdaTimeStore';
import type { ActionsMap } from '../../actions/index';
import type { Api } from '../../api/index';
import type { StoresMap } from '../index';

export const adaStoreClasses = Object.freeze({
  wallets: AdaWalletsStore,
  paperWallets: PaperWalletCreateStore,
  transactions: AdaTransactionsStore,
  addresses: AddressesStore,
  daedalusTransfer: AdaDaedalusTransferStore,
  yoroiTransfer: AdaYoroiTransferStore,
  trezorConnect: TrezorConnectStore,
  trezorSend: TrezorSendStore,
  ledgerConnect: LedgerConnectStore,
  ledgerSend: LedgerSendStore,
  hwVerifyAddress: HWVerifyAddressStore,
  stateFetchStore: AdaStateFetchStore,
  transactionBuilderStore: AdaTransactionBuilderStore,
  walletRestore: AdaWalletRestoreStore,
  time: AdaTimeStore,
});

export type AdaStoresMap = {|
  wallets: AdaWalletsStore,
  paperWallets: PaperWalletCreateStore,
  transactions: AdaTransactionsStore,
  addresses: AddressesStore,
  daedalusTransfer: AdaDaedalusTransferStore,
  yoroiTransfer: AdaYoroiTransferStore,
  trezorConnect: TrezorConnectStore,
  trezorSend: TrezorSendStore,
  ledgerConnect: LedgerConnectStore,
  ledgerSend: LedgerSendStore,
  hwVerifyAddress: HWVerifyAddressStore,
  stateFetchStore: AdaStateFetchStore,
  transactionBuilderStore: AdaTransactionBuilderStore,
  walletRestore: AdaWalletRestoreStore,
  time: AdaTimeStore,
|};

const adaStores: WithNullableFields<AdaStoresMap> = observable({
  wallets: null,
  paperWallets: null,
  transactions: null,
  addresses: null,
  daedalusTransfer: null,
  yoroiTransfer: null,
  trezorConnect: null,
  trezorSend: null,
  ledgerConnect: null,
  ledgerSend: null,
  hwVerifyAddress: null,
  stateFetchStore: null,
  transactionBuilderStore: null,
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
  ): AdaStoresMap => {
    const storeNames: Array<$Keys<typeof adaStoreClasses>> = Object.keys(adaStoreClasses);
    storeNames.forEach(name => { if (adaStores[name]) adaStores[name].teardown(); });
    storeNames.forEach(name => {
      adaStores[name] = ((new adaStoreClasses[name](stores, api, actions)): any);
    });
    return (adaStores: any);
  }
): (StoresMap, Api, ActionsMap) => AdaStoresMap);
