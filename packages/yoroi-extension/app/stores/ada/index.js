// @flow

// File is based the same pattern used for the non-ada-specific stores in our app.

import { observable, action } from 'mobx';
import AdaWalletsStore from './AdaWalletsStore';
import AdaTransactionsStore from './AdaTransactionsStore';
import AddressesStore from './AdaAddressesStore';
import AdaYoroiTransferStore from './AdaYoroiTransferStore';
import TrezorConnectStore from './TrezorConnectStore';
import TrezorSendStore from './send/TrezorSendStore';
import LedgerConnectStore from './LedgerConnectStore';
import LedgerSendStore from './send/LedgerSendStore';
import HWVerifyAddressStore from './HWVerifyAddressStore';
import AdaStateFetchStore from './AdaStateFetchStore';
import AdaWalletRestoreStore from './AdaWalletRestoreStore';
import AdaDelegationTransactionStore from './AdaDelegationTransactionStore';
import AdaDelegationStore from './AdaDelegationStore';
import AdaTimeStore from './AdaTimeStore';
import AdaMnemonicSendStore from './send/AdaMnemonicSendStore';
import VotingStore from './VotingStore';
import SwapStore from './SwapStore';
import type { ActionsMap } from '../../actions/index';
import type { Api } from '../../api/index';
import type { StoresMap } from '../index';

export const adaStoreClasses = Object.freeze({
  wallets: AdaWalletsStore,
  transactions: AdaTransactionsStore,
  addresses: AddressesStore,
  yoroiTransfer: AdaYoroiTransferStore,
  trezorConnect: TrezorConnectStore,
  trezorSend: TrezorSendStore,
  ledgerConnect: LedgerConnectStore,
  ledgerSend: LedgerSendStore,
  hwVerifyAddress: HWVerifyAddressStore,
  stateFetchStore: AdaStateFetchStore,
  delegationTransaction: AdaDelegationTransactionStore,
  walletRestore: AdaWalletRestoreStore,
  delegation: AdaDelegationStore,
  time: AdaTimeStore,
  mnemonicSend: AdaMnemonicSendStore,
  votingStore: VotingStore,
  swapStore: SwapStore,
});

export type AdaStoresMap = {|
  wallets: AdaWalletsStore,
  transactions: AdaTransactionsStore,
  addresses: AddressesStore,
  yoroiTransfer: AdaYoroiTransferStore,
  trezorConnect: TrezorConnectStore,
  trezorSend: TrezorSendStore,
  ledgerConnect: LedgerConnectStore,
  ledgerSend: LedgerSendStore,
  hwVerifyAddress: HWVerifyAddressStore,
  stateFetchStore: AdaStateFetchStore<StoresMap, ActionsMap>,
  delegationTransaction: AdaDelegationTransactionStore,
  walletRestore: AdaWalletRestoreStore,
  delegation: AdaDelegationStore,
  time: AdaTimeStore,
  mnemonicSend: AdaMnemonicSendStore,
  votingStore: VotingStore,
  swapStore: SwapStore,
|};

const adaStores: WithNullableFields<AdaStoresMap> = observable({
  wallets: null,
  transactions: null,
  addresses: null,
  yoroiTransfer: null,
  trezorConnect: null,
  trezorSend: null,
  ledgerConnect: null,
  ledgerSend: null,
  hwVerifyAddress: null,
  stateFetchStore: null,
  delegationTransaction: null,
  walletRestore: null,
  delegation: null,
  time: null,
  mnemonicSend: null,
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
