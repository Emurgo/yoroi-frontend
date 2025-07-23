// @flow

// File is based the same pattern used for the non-ada-specific stores in our app.

import { observable, action } from 'mobx';
import MnemonicWalletCreationStore from './MnemonicWalletCreationStore';
import AdaTransactionsStore from './AdaTransactionsStore';
import AddressesStore from './AdaAddressesStore';
import AdaYoroiTransferStore from './AdaYoroiTransferStore';
import TrezorConnectStore from './TrezorConnectStore';
import LedgerConnectStore from './LedgerConnectStore';
import HWVerifyAddressStore from './HWVerifyAddressStore';
import AdaStateFetchStore from './AdaStateFetchStore';
import AdaWalletRestoreStore from './AdaWalletRestoreStore';
import AdaDelegationTransactionStore from './AdaDelegationTransactionStore';
import AdaDelegationStore from './AdaDelegationStore';
import VotingStore from './VotingStore';
import SwapStore from './SwapStore';
import type { Api } from '../../api/index';
import type { StoresMap } from '../index';
import BaseCardanoTimeStore from '../base/BaseCardanoTimeStore';

export const adaStoreClasses = Object.freeze({
  mnemonicWalletCreationStore: MnemonicWalletCreationStore,
  transactions: AdaTransactionsStore,
  addresses: AddressesStore,
  yoroiTransfer: AdaYoroiTransferStore,
  trezorConnect: TrezorConnectStore,
  ledgerConnect: LedgerConnectStore,
  hwVerifyAddress: HWVerifyAddressStore,
  stateFetchStore: AdaStateFetchStore,
  delegationTransaction: AdaDelegationTransactionStore,
  walletRestore: AdaWalletRestoreStore,
  delegation: AdaDelegationStore,
  time: BaseCardanoTimeStore,
  votingStore: VotingStore,
  swapStore: SwapStore,
});

export type AdaStoresMap = {|
  mnemonicWalletCreationStore: MnemonicWalletCreationStore,
  transactions: AdaTransactionsStore,
  addresses: AddressesStore,
  yoroiTransfer: AdaYoroiTransferStore,
  trezorConnect: TrezorConnectStore,
  ledgerConnect: LedgerConnectStore,
  hwVerifyAddress: HWVerifyAddressStore,
  stateFetchStore: AdaStateFetchStore<StoresMap>,
  delegationTransaction: AdaDelegationTransactionStore,
  walletRestore: AdaWalletRestoreStore,
  delegation: AdaDelegationStore,
  time: BaseCardanoTimeStore,
  votingStore: VotingStore,
  swapStore: SwapStore,
|};

const adaStores: WithNullableFields<AdaStoresMap> = observable({
  mnemonicWalletCreationStore: null,
  transactions: null,
  addresses: null,
  yoroiTransfer: null,
  trezorConnect: null,
  ledgerConnect: null,
  hwVerifyAddress: null,
  stateFetchStore: null,
  delegationTransaction: null,
  walletRestore: null,
  delegation: null,
  time: null,
  votingStore: null,
  swapStore: null,
});

/** See `stores` index for description of this weird behavior
 * Note: stores created here are NOT initialized
 */
export default (action(
  (
    stores: StoresMap,
    api: Api,
  ): AdaStoresMap => {
    const storeNames: Array<$Keys<typeof adaStoreClasses>> = Object.keys(adaStoreClasses);
    storeNames.forEach(name => { if (adaStores[name]) adaStores[name].teardown(); });
    storeNames.forEach(name => {
      adaStores[name] = ((new adaStoreClasses[name](stores, api)): any);
    });
    return (adaStores: any);
  }
): (StoresMap, Api) => AdaStoresMap);
