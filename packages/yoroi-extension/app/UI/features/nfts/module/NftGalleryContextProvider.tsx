import type { StoresMap } from '../../../../stores';
import * as React from 'react';
import { observer } from 'mobx-react';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';
import { NftGalleryContextType } from '../common/types';

const defaultNftGalleryState = {
  spendableBalance: null,
  getTokenInfo: () => null,
  selectedWallet: null,
};
export const NftGalleryContext = React.createContext<NftGalleryContextType>(defaultNftGalleryState);

type NftGalleryProviderProps = {
  children: React.ReactNode;
  stores: StoresMap;
};

export const NftGalleryContextProvider = observer(({ children, stores }: NftGalleryProviderProps) => {
  const { wallets, transactions, tokenInfoStore } = stores;

  const selectedWallet = wallets.selected;
  const spendableBalance = transactions.balance;
  const getTokenInfo = genLookupOrFail(tokenInfoStore.tokenInfo);

  const initialState = { selectedWallet, spendableBalance, getTokenInfo };

  const state = React.useMemo(
    () => ({
      ...defaultNftGalleryState,
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

  return <NftGalleryContext.Provider value={context}>{children}</NftGalleryContext.Provider>;
});

export const useNftGallery = () =>
  React.useContext<NftGalleryContextType>(NftGalleryContext) ??
  console.log('useNftGallery: needs to be wrapped in a NftGalleryContextProvider');
