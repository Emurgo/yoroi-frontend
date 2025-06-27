import * as React from 'react';
import { createCurrrentWalletInfo } from '../../../utils/createCurrentWalletInfo';

const initialSwapProvider = {};

const SwapContext = React.createContext(initialSwapProvider);

export const SwapContextProvider = ({ children, stores }: any) => {
  const currentWallet = createCurrrentWalletInfo(stores);
  if (!currentWallet?.selectedWallet) throw new Error(`requires a wallet to be selected`);

  const context: any = {};

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>;
};

export const useSwapRevamp = () =>
  React.useContext(SwapContext) ?? console.log('useSwapRevamp: needs to be wrapped in a SwapContextProvider');
