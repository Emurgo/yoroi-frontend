// flow
import * as React from 'react';

import {
  GouvernanceAction,
  GouvernanceActionType,
  GouvernanceReducer,
  defaultGouvernanceActions,
  defaultGouvernanceState,
  GouvernanceState,
  GouvernanceActions,
} from './state';

import { getStrings } from '../common/useStrings';
import { useGovernanceManagerMaker } from '../common/useGovernanceManagerMaker';

const initialGouvernanceProvider = {
  ...defaultGouvernanceState,
  ...defaultGouvernanceActions,
};
const GouvernanceContext = React.createContext(initialGouvernanceProvider);

type GouvernanceProviderProps = any;

export const GouvernanceContextProvider = ({ children, intl, currentWallet, currentPoolInfo }: GouvernanceProviderProps) => {
  const [state, dispatch] = React.useReducer(GouvernanceReducer, {
    ...defaultGouvernanceState,
    gouvernanceStatus: 'none',
  });
  console.log('[CONTEXT Current Wallet Info]', currentWallet);
  const { walletId, networkId, currentPool } = currentWallet;
  const gouvernanceManager = useGovernanceManagerMaker(walletId, networkId);
  console.log('[CONTEXT gouvernanceManager]', gouvernanceManager);

  const actions = React.useRef({
    gouvernanceStatusChanged: (status: any) => {
      dispatch({
        type: GouvernanceActionType.GouvernanceStatusChanged,
        gouvernanceStatus: status,
      });
    },
    dRepIdChanged: (id: string) => {
      dispatch({ type: GouvernanceActionType.DRepIdChanged, dRepId: id });
    },
  }).current;

  const context = {
    ...state,
    // ...gouvernanceApi,
    ...actions,
    strings: getStrings(intl),
    gouvernanceManager: gouvernanceManager,
    stakePoolKeyHash: currentPool.hash ?? '',
  };

  return <GouvernanceContext.Provider value={context}>{children}</GouvernanceContext.Provider>;
};

export const useGovernance = () =>
  React.useContext(GouvernanceContext) ?? invalid('useGovernance: needs to be wrapped in a GouvernanceManagerProvider');
