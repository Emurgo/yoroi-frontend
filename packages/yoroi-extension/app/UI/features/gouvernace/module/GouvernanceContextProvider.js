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

const initialGouvernanceProvider = {
  ...defaultGouvernanceState,
  ...defaultGouvernanceActions,
};
const GouvernanceContext = React.createContext(initialGouvernanceProvider);

type GouvernanceProviderProps = any;

export const GouvernanceContextProvider = ({
  children,
  // gouvernanceApi,
  initialState,
}: GouvernanceProviderProps) => {
  const [state, dispatch] = React.useReducer(GouvernanceReducer, {
    ...defaultGouvernanceState,
    ...initialState,
  });

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

  const context = React.useMemo(
    () => ({
      ...state,
      // ...gouvernanceApi,
      ...actions,
    }),
    [state, actions]
  );

  return <GouvernanceContext.Provider value={context}>{children}</GouvernanceContext.Provider>;
};

export const useGouvernance = () =>
  React.useContext(GouvernanceContext) ??
  invalid('useGouvernance: needs to be wrapped in a GouvernanceManagerProvider');
