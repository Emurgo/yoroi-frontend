import * as React from 'react';

import {
  GovernanceAction,
  GovernanceActionType,
  GovernanceReducer,
  defaultGovernanceActions,
  defaultGovernanceState,
  GovernanceState,
  GovernanceActions,
} from './state';

import { useGovernanceManagerMaker } from '../common/useGovernanceManagerMaker';

const initialGovernanceProvider = {
  ...defaultGovernanceState,
  ...defaultGovernanceActions,
};
const GovernanceContext = React.createContext(initialGovernanceProvider);

type GovernanceProviderProps = {
  children: Node;
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
    dRepIdChanged: (drepID: string) => {
      dispatch({ type: GovernanceActionType.DRepIdChanged, drepID });
    },
  }).current;

  const context = {
    ...state,
    ...actions,
    governanceManager: governanceManager,
    stakePoolKeyHash: currentPool?.hash ?? '',
    walletId: currentWallet.walletId,
  };

  return <GovernanceContext.Provider value={context}>{children}</GovernanceContext.Provider>;
};

export const useGovernance = () =>
  React.useContext(GovernanceContext) ?? invalid('useGovernance: needs to be wrapped in a GovernanceManagerProvider');
