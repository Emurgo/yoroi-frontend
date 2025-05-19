import type { StoresMap } from '../../../../stores';
import * as React from 'react';
import { observer } from 'mobx-react';
import { CatalystRegistrationContextType } from '../common/types';

const defaultCatalystRegistrationState = {
  selectedWallet: null,
  isDelegating: false,
};

export const CatalystRegistrationContext = React.createContext<CatalystRegistrationContextType>(defaultCatalystRegistrationState);

type CatalystRegistrationProviderProps = {
  children: React.ReactNode;
  stores: StoresMap;
};

export const CatalystRegistrationContextProvider = observer(({ children, stores }: CatalystRegistrationProviderProps) => {
  const { wallets, delegation } = stores;

  const selectedWallet = wallets.selected;
  const isDelegating = delegation.isCurrentlyDelegating(selectedWallet?.publicDeriverId);

  const initialState = { selectedWallet, isDelegating };

  const state = React.useMemo(
    () => ({
      ...defaultCatalystRegistrationState,
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

  return <CatalystRegistrationContext.Provider value={context}>{children}</CatalystRegistrationContext.Provider>;
});

export const useCatalystRegistration = () =>
  React.useContext<CatalystRegistrationContextType>(CatalystRegistrationContext) ??
  console.log('useCatalystRegistration: needs to be wrapped in a CatalystRegistrationContextProvider');
