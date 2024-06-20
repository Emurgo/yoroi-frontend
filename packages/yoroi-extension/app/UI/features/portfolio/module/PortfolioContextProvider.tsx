import * as React from 'react';

import { CurrencyType, PortfolioActionType, PortfolioReducer, defaultPortfolioActions, defaultPortfolioState } from './state';

const initialPortfolioProvider = {
  ...defaultPortfolioState,
  ...defaultPortfolioActions,
};
const PortfolioContext = React.createContext(initialPortfolioProvider);

type PortfolioProviderProps = {
  children: React.ReactNode;
  settingFiatPairUnit: {
    currency: CurrencyType;
    enabled: boolean;
  };
  initialState: {
    unitOfAccount: CurrencyType;
  };
  currentWalletInfo: any; // TODO to be defined
};

export const PortfolioContextProvider = ({
  children,
  settingFiatPairUnit,
  initialState = {
    unitOfAccount: settingFiatPairUnit.enabled ? settingFiatPairUnit.currency : 'USD',
  },
  currentWalletInfo,
}: PortfolioProviderProps) => {
  console.log('currentWalletInfo', currentWalletInfo);

  const { walletBalance, primaryTokenInfo, assetList } = currentWalletInfo;
  console.log('walletBalance', walletBalance);
  const [state, dispatch] = React.useReducer(PortfolioReducer, {
    ...defaultPortfolioState,
    ...initialState,
  });

  const actions = React.useRef({
    changeUnitOfAccount: (currency: CurrencyType) => {
      dispatch({
        type: PortfolioActionType.changeUnitOfAccount,
        unitOfAccount: currency,
      });
    },
  }).current;

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
      settingFiatPairUnit,
      walletBalance,
      primaryTokenInfo,
      assetList,
    }),
    [state, actions]
  );

  return <PortfolioContext.Provider value={context}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () =>
  React.useContext(PortfolioContext) ?? console.log('usePortfolio: needs to be wrapped in a PortfolioManagerProvider');
