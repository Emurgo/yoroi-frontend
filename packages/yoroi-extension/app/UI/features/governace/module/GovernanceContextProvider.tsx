import * as React from 'react';

import { GovernanceActionType, GovernanceReducer, defaultGovernanceActions, defaultGovernanceState } from './state';
import { useGovernanceManagerMaker } from '../common/useGovernanceManagerMaker';

const initialGovernanceProvider = {
  ...defaultGovernanceState,
  ...defaultGovernanceActions,
  walletId: '',
  governanceManager: null,
};
const GovernanceContext = React.createContext(initialGovernanceProvider);

type GovernanceProviderProps = {
  children: React.ReactNode;
  currentWallet: any; // TODO to be defined
};

export const GovernanceContextProvider = ({ children, currentWallet }: GovernanceProviderProps) => {
  const [state, dispatch] = React.useReducer(GovernanceReducer, {
    ...defaultGovernanceState,
  });
  const { walletId, networkId, currentPool } = currentWallet;
  const governanceManager = useGovernanceManagerMaker(walletId, networkId);

  const actions = React.useRef({
    governanceVoteChanged: (vote: any) => {
      dispatch({
        type: GovernanceActionType.GovernanceVoteChanged,
        governanceVote: vote,
      });
    },
    dRepIdChanged: (dRepId: any) => {
      dispatch({ type: GovernanceActionType.DRepIdChanged, dRepId });
    },
  }).current;

  const context: any = {
    ...state,
    ...actions,
    governanceManager: governanceManager,
    stakePoolKeyHash: currentPool?.hash ?? '',
    walletId: currentWallet.walletId,
  };

  return <GovernanceContext.Provider value={context}>{children}</GovernanceContext.Provider>;
};

export const useGovernance = () =>
  React.useContext(GovernanceContext) ?? console.log('useGovernance: needs to be wrapped in a GovernanceManagerProvider');
