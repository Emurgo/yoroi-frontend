import type { StoresMap } from '../../../../stores';
import * as React from 'react';
import { observer } from 'mobx-react';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';
import { WalletContextType } from '../common/types';
import { allAddressSubgroups, applyAddressFilter, routeForStore } from '../../../../stores/stateless/addressStores';
import { AddressGroupTypes } from '../../../../types/AddressFilterTypes';

const defaultWalletState = {
  spendableBalance: null,
  getTokenInfo: () => null,
  selectedWallet: null,
  hwVerifyAddress: null,
  addressTypeStore: null,
  lastAddress: null,
  isAddressBook: null,
  isHwWallet: null,
  walletAddresses: null,
};

export const WalletContext = React.createContext<WalletContextType>(defaultWalletState);

type WalletProviderProps = {
  children: React.ReactNode;
  stores: StoresMap;
};

export const WalletContextProvider = observer(({ children, stores }: WalletProviderProps) => {
  const { wallets, transactions, tokenInfoStore, routing, addresses, substores } = stores;

  const {
    ada: { hwVerifyAddress },
  } = substores;

  const selectedWallet = wallets.selected;
  const spendableBalance = transactions.balance;
  const getTokenInfo = genLookupOrFail(tokenInfoStore.tokenInfo);

  const getAddressTypeStore = () => {
    for (const addressStore of allAddressSubgroups) {
      if (!addressStore.isRelated()) {
        continue;
      }
      if (routing.currentRoute.startsWith(routeForStore(addressStore.name))) {
        const request = addresses.addressSubgroupMap.get(addressStore.class);
        if (request == null) throw new Error('Should never happen');
        return {
          request,
          meta: addressStore,
        };
      }
    }

    return { request: null, meta: null };
  };

  const addressTypeStore = getAddressTypeStore();

  const lastAddress = addressTypeStore?.request?.all?.[addressTypeStore?.request?.all?.length - 1];
  const isAddressBook = addressTypeStore?.meta?.name?.group === AddressGroupTypes.addressBook;
  const isHwWallet = selectedWallet.type !== 'mnemonic';

  const walletAddresses = applyAddressFilter({
    addressFilter: addresses.addressFilter,
    addresses: addressTypeStore?.request?.all,
  })
    ?.slice()
    ?.reverse();

  const initialState = {
    selectedWallet,
    spendableBalance,
    getTokenInfo,
    hwVerifyAddress,
    addressTypeStore,
    lastAddress,
    isAddressBook,
    isHwWallet,
    walletAddresses,
  };

  const state = React.useMemo(
    () => ({
      ...defaultWalletState,
      ...initialState,
    }),
    [initialState]
  );

  const actions = React.useRef({}).current;

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions]
  );

  return <WalletContext.Provider value={context}>{children}</WalletContext.Provider>;
});

export const useWallet = () =>
  React.useContext<WalletContextType>(WalletContext) ?? console.log('useWallet: needs to be wrapped in a WalletContextProvider');
