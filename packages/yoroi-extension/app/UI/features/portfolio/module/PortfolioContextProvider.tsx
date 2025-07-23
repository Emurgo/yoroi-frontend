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

export const PortfolioDetailsTab = {
  Performance: 'Performance',
  Overview: 'Overview',
  Transactions: 'Transactions',
} as const;
export type PortfolioDetailsTab = typeof PortfolioDetailsTab[keyof typeof PortfolioDetailsTab];

export const PortfolioListTab = {
  Wallet: 'Wallet',
  Dapps: 'Dapps',
} as const;

export type PortfolioListTab = typeof PortfolioListTab[keyof typeof PortfolioListTab];

import BuySellDialog from '../../../../components/buySell/BuySellDialog';
import { DEFAULT_FIAT_PAIR } from '../common/helpers/constants';
import links from '../../../../links';

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
  initialState?: {
    unitOfAccount: CurrencyType;
    accountPair: AccountPair;
  };
  currentWallet: CurrentWalletType;
  openDialogWrapper: (dialog: React.ReactNode) => void;
  shouldHideBalance: boolean;
};

export const PortfolioContextProvider = ({
  children,
  settingFiatPairUnit,
  initialState = {
    unitOfAccount: settingFiatPairUnit.enabled ? settingFiatPairUnit.currency : DEFAULT_FIAT_PAIR,
    accountPair: null,
  },
  currentWallet,
  openDialogWrapper,
  shouldHideBalance,
}: PortfolioProviderProps) => {
  const { walletBalance, ftAssetList, selectedWallet, networkId, primaryTokenInfo, backendServiceZero, explorer } = currentWallet;

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
      ftAssetList: ftAssetList || [],
      networkId,
      primaryTokenInfo,
      isHiddenAmount: shouldHideBalance,
      openBuyDialog: () => {
        if (selectedWallet.isTestnet) {
          window.open(links.testnetFaucet, '_blank');
        } else {
          openDialogWrapper(BuySellDialog);
        }
      },
      showWelcomeBanner: ftAssetList.length === 1,
      backendServiceZero: backendServiceZero,
      explorer,
      isTestnet: selectedWallet.isTestnet,
    }),
    [state, actions, ftAssetList]
  );

  return <PortfolioContext.Provider value={context}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () =>
  React.useContext(PortfolioContext) ?? console.log('usePortfolio: needs to be wrapped in a PortfolioManagerProvider');
