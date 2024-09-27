import * as React from 'react';

import { CurrentWalletType } from '../../../types/currrentWallet';
import {
  AccountPair,
  CurrencyType,
  PortfolioActionType,
  PortfolioReducer,
  defaultPortfolioActions,
  defaultPortfolioState,
} from './state';

import BuySellDialog from '../../../../components/buySell/BuySellDialog';

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
    accountPair: AccountPair;
  };
  currentWallet: CurrentWalletType;
  openDialogWrapper: (dialog: React.ReactNode) => void;
};

export const PortfolioContextProvider = ({
  children,
  settingFiatPairUnit,
  initialState = {
    unitOfAccount: settingFiatPairUnit.enabled ? settingFiatPairUnit.currency : 'USD',
    accountPair: null,
  },
  currentWallet,
  openDialogWrapper,
}: PortfolioProviderProps) => {
  const { walletBalance, assetList, selectedWallet, networkId, primaryTokenInfo } = currentWallet;
  if (selectedWallet === undefined) {
    return <></>;
  }

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
    changeUnitOfAccountPair: (payload: any) => {
      dispatch({
        type: PortfolioActionType.changeUnitOfAccountPair,
        accountPair: {
          from: { name: payload.from.name, value: payload.from.value },
          to: { name: payload.to.name, value: payload.to.value },
        },
      });
    },
  }).current;

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
      settingFiatPairUnit,
      walletBalance,
      assetList: assetList || [],
      networkId,
      primaryTokenInfo,
      openBuyDialog: () => openDialogWrapper(BuySellDialog),
      showWelcomeBanner: assetList.length === 1,
    }),
    [state, actions, assetList]
  );

  return <PortfolioContext.Provider value={context}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () =>
  React.useContext(PortfolioContext) ?? console.log('usePortfolio: needs to be wrapped in a PortfolioManagerProvider');
