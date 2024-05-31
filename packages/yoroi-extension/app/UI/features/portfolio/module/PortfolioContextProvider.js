// flow
import * as React from 'react';

import {
  PortfolioAction,
  PortfolioActionType,
  PortfolioReducer,
  defaultPortfolioActions,
  defaultPortfolioState,
  PortfolioState,
  PortfolioActions,
} from './state';

const initialPortfolioProvider = {
  ...defaultPortfolioState,
  ...defaultPortfolioActions,
};
const PortfolioContext = React.createContext(initialPortfolioProvider);

type PortfolioProviderProps = any;

export const PortfolioContextProvider = ({
  children,
  initialState = {
    unitOfAccount: 'USD',
  },
}: PortfolioProviderProps) => {
  const [state, dispatch] = React.useReducer(PortfolioReducer, {
    ...defaultPortfolioState,
    ...initialState,
  });

  const actions = React.useRef({
    changeUnitOfAccount: (currency: string) => {
      dispatch({
        type: PortfolioActionType.UnitOfAccountChanged,
        unitOfAccount: currency.toLowerCase() === 'ada' ? 'ADA' : 'USD',
      });
    },
  }).current;

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions]
  );

  return <PortfolioContext.Provider value={context}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () =>
  React.useContext(PortfolioContext) ?? invalid('usePortfolio: needs to be wrapped in a PortfolioManagerProvider');
