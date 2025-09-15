import type { StoresMap } from '../../../../stores';
import * as React from 'react';
import { observer } from 'mobx-react';

const defaultReceiveState = {
  spendableBalance: null,
  getTokenInfo: () => null,
  selectedWallet: null,
};
export const ReceiveContext = React.createContext<any>(defaultReceiveState);

type ReceiveContextProviderProps = {
  children: React.ReactNode;
  stores: StoresMap;
};

export const ReceiveContextProvider = observer(({ children, stores }: ReceiveContextProviderProps) => {
  const { wallets } = stores;

  const selectedWallet = wallets.selected;

  const initialState = { selectedWallet };

  const state = React.useMemo(
    () => ({
      ...defaultReceiveState,
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

  return <ReceiveContext.Provider value={context}>{children}</ReceiveContext.Provider>;
});

export const useReceive = () =>
  React.useContext(ReceiveContext) ?? console.log('useReceive: needs to be wrapped in a Receive ContextProvider');
