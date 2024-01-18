//@flow
import { useContext } from 'react';
import SwapPageContext from './context';

export default function useSwapPage(): any {
  const context = useContext(SwapPageContext);

  if (context === undefined) {
    throw new Error('useSwapPage must be used within a SwapPageProvider');
  }

  const {
    state: { stores },
  } = context;

  return {
    spendableBalance: stores.transactions?.balance,
    tokenInfo: stores.tokenInfoStore?.tokenInfo,
    // balance: stores.transactions.getBalance,
  };
}
