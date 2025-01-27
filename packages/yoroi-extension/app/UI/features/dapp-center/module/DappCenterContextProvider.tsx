import * as React from 'react';

import { CurrentWalletType } from '../../../types/currrentWallet';
import {
  DappCenterReducer,
  defaultDappCenterActions,
  defaultDappCenterState,
} from './state';


import BuySellDialog from '../../../../components/buySell/BuySellDialog';

const initialDappCenterProvider = {
  ...defaultDappCenterState,
  ...defaultDappCenterActions,
};
const DappCenterContext = React.createContext(initialDappCenterProvider);

type DappCenterProviderProps = {
  children: React.ReactNode;
  initialState?: {};
  currentWallet: CurrentWalletType;
  openDialogWrapper: (dialog: React.ReactNode) => void;
};

export const DappCenterContextProvider = ({
  children,
  initialState = {},
  currentWallet,
  openDialogWrapper,
}: DappCenterProviderProps) => {
  const { walletBalance, ftAssetList, selectedWallet, networkId, primaryTokenInfo, backendServiceZero, explorer } = currentWallet;
  if (selectedWallet === undefined) {
    return <></>;
  }

  const [state] = React.useReducer(DappCenterReducer, {
    ...defaultDappCenterState,
    ...initialState,
  });

  const actions = React.useRef({}).current;

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
      walletBalance,
      ftAssetList: ftAssetList || [],
      networkId,
      primaryTokenInfo,
      openBuyDialog: () => openDialogWrapper(BuySellDialog),
      showWelcomeBanner: ftAssetList.length === 1,
      backendServiceZero: backendServiceZero,
      explorer,
    }),
    [state, actions, ftAssetList]
  );

  return <DappCenterContext.Provider value={context}>{children}</DappCenterContext.Provider>;
};

export const useDappCenter = () =>
  React.useContext(DappCenterContext) ?? console.log('useDappCenter: needs to be wrapped in a DappCenterManagerProvider');
