// @flow

import { observable, action } from 'mobx';
import JormungandrWalletsStore from './JormungandrWalletsStore';
import JormungandrTransactionsStore from './JormungandrTransactionsStore';
import AddressesStore from './JormungandrAddressesStore';
import JormungandrDaedalusTransferStore from './JormungandrDaedalusTransferStore';
import JormungandrYoroiTransferStore from './JormungandrYoroiTransferStore';
import JormungandrTransactionBuilderStore from './JormungandrTransactionBuilderStore';
import JormungandrStateFetchStore from './JormungandrStateFetchStore';
import JormungandrWalletRestoreStore from './JormungandrWalletRestoreStore';
import DelegationTransactionStore from './DelegationTransactionStore';
import DelegationStore from './DelegationStore';
import JormungandrTimeStore from './JormungandrTimeStore';
import type { ActionsMap } from '../../actions/index';
import type { Api } from '../../api/index';
import type { StoresMap } from '../index';

export const jormungandrStoreClasses = Object.freeze({
  wallets: JormungandrWalletsStore,
  transactions: JormungandrTransactionsStore,
  addresses: AddressesStore,
  daedalusTransfer: JormungandrDaedalusTransferStore,
  yoroiTransfer: JormungandrYoroiTransferStore,
  stateFetchStore: JormungandrStateFetchStore,
  transactionBuilderStore: JormungandrTransactionBuilderStore,
  walletRestore: JormungandrWalletRestoreStore,
  delegationTransaction: DelegationTransactionStore,
  delegation: DelegationStore,
  time: JormungandrTimeStore,
});

export type JormungandrStoresMap = {|
  wallets: JormungandrWalletsStore,
  transactions: JormungandrTransactionsStore,
  addresses: AddressesStore,
  daedalusTransfer: JormungandrDaedalusTransferStore,
  yoroiTransfer: JormungandrYoroiTransferStore,
  stateFetchStore: JormungandrStateFetchStore,
  transactionBuilderStore: JormungandrTransactionBuilderStore,
  walletRestore: JormungandrWalletRestoreStore,
  delegationTransaction: DelegationTransactionStore,
  delegation: DelegationStore,
  time: JormungandrTimeStore,
|};

const jormungandrStores: WithNullableFields<JormungandrStoresMap> = observable({
  wallets: null,
  transactions: null,
  addresses: null,
  daedalusTransfer: null,
  yoroiTransfer: null,
  stateFetchStore: null,
  transactionBuilderStore: null,
  walletRestore: null,
  delegationTransaction: null,
  delegation: null,
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
  ): JormungandrStoresMap => {
    const storeNames: Array<$Keys<typeof jormungandrStoreClasses>> = Object.keys(
      jormungandrStoreClasses
    );
    storeNames.forEach(name => {
      if (jormungandrStores[name]) jormungandrStores[name].teardown();
    });
    storeNames.forEach(name => {
      jormungandrStores[name] = ((new jormungandrStoreClasses[name](stores, api, actions)): any);
    });
    return (jormungandrStores: any);
  }
): (StoresMap, Api, ActionsMap) => JormungandrStoresMap);
