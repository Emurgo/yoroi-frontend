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

import { getStrings } from '../common/useStrings';

const initialPortfolioProvider = {
  ...defaultPortfolioState,
  ...defaultPortfolioActions,
};
const PortfolioContext = React.createContext(initialPortfolioProvider);

type PortfolioProviderProps = any;

export const PortfolioContextProvider = ({
  children,
  initialState = {
    portfolioStatus: 'none',
  },
  intl,
}: PortfolioProviderProps) => {
  const [state, dispatch] = React.useReducer(PortfolioReducer, {
    ...defaultPortfolioState,
    ...initialState,
  });

  const actions = React.useRef({
    portfolioStatusChanged: (status: any) => {
      dispatch({
        type: PortfolioActionType.PortfolioStatusChanged,
        portfolioStatus: status,
      });
    },
  }).current;

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
      strings: getStrings(intl),
    }),
    [state, actions]
  );

  return <PortfolioContext.Provider value={context}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () =>
  React.useContext(PortfolioContext) ??
  invalid('usePortfolio: needs to be wrapped in a PortfolioManagerProvider');
