import React from 'react';

import { configCurrencies } from '../types/other';
import { supportedCurrencies } from '../utils/constants';
import { usePrimaryTokenActivity } from '../utils/usePrimaryTokenActivity';

const CurrencyContext = React.createContext<undefined | any>(undefined);
export const CurrencyProvider = ({ currency, children }: { currency: any; children: React.ReactNode }) => {
  console.log('currency', currency);
  const { ptActivity, isLoading } = usePrimaryTokenActivity({ to: currency });

  console.log('ptActivity', ptActivity);
  const value = React.useMemo(
    () => ({
      currency,
      supportedCurrencies,
      configCurrencies,
      config: configCurrencies[currency],
      ptActivity,
      isLoading,
    }),
    [currency, ptActivity, isLoading]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrencyPairing = () => React.useContext(CurrencyContext) || missingProvider();

const missingProvider = () => {
  throw new Error('CurrencyProvider is missing');
};
