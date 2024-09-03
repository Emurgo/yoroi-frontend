import { freeze } from 'immer';
import { supportedCurrencies } from '../utils/constants';

export type CurrencySymbol = keyof typeof supportedCurrencies;

export type PriceMultipleResponse = {
  error: string | null;
  tickers: Array<{
    from: 'ADA'; // we don't support ERG yet
    timestamp: number;
    signature: string;
    prices: Record<CurrencySymbol, number>;
  }>;
};

export const configCurrencies = freeze({
  [supportedCurrencies.ADA]: {
    decimals: 6,
    nativeName: 'Cardano',
  },
  [supportedCurrencies.BRL]: {
    decimals: 2,
    nativeName: 'Real',
  },
  [supportedCurrencies.BTC]: {
    decimals: 8,
    nativeName: 'Bitcoin',
  },
  [supportedCurrencies.CNY]: {
    decimals: 2,
    nativeName: '人民币',
  },
  [supportedCurrencies.ETH]: {
    decimals: 8,
    nativeName: 'Ethereum',
  },
  [supportedCurrencies.EUR]: {
    decimals: 2,
    nativeName: 'Euro',
  },
  [supportedCurrencies.JPY]: {
    decimals: 2,
    nativeName: '日本円',
  },
  [supportedCurrencies.KRW]: {
    decimals: 2,
    nativeName: '대한민국 원',
  },
  [supportedCurrencies.USD]: {
    decimals: 2,
    nativeName: 'US Dollar',
  },
});
