import * as React from 'react';
import { defaultSwapState, SwapActionType, SwapReducer } from './state';

const initialSwapProvider = {};

const SwapContext = React.createContext(initialSwapProvider);

export const SwapContextProvider = ({ children, currentWallet }: any) => {
  if (!currentWallet?.selectedWallet) throw new Error(`requires a wallet to be selected`);
  const { ftAssetList, primaryTokenInfo } = currentWallet;

  const [state, dispatch] = React.useReducer(SwapReducer, {
    ...defaultSwapState,
  });

  const actions = React.useRef({
    selectAssetToSell: (asset: any) => {
      dispatch({
        type: SwapActionType.SelectAssetToSell,
        asset: asset,
      });
    },
    selectAssetToBuy: (asset: any) => {
      dispatch({
        type: SwapActionType.SelectAssetToSell,
        asset: asset,
      });
    },
  }).current;

  const context: any = {
    ...state,
    ...actions,
    ftAssetList: ftAssetList || [],
    primaryTokenInfo,
  };

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>;
};

export const useSwapRevamp = () =>
  React.useContext(SwapContext) ?? console.log('useSwapRevamp: needs to be wrapped in a SwapContextProvider');
