import { freeze } from 'immer';

export const time = freeze({
  oneSecond: 1e3,
  oneMinute: 60 * 1e3,
  fiveMinutes: 5 * 60 * 1e3,
  halfHour: 30 * 60 * 1e3,
  oneHour: 60 * 60 * 1e3,
  oneDay: 24 * 60 * 60 * 1e3,
  oneWeek: 7 * 24 * 60 * 60 * 1e3,
  oneMonth: 30 * 24 * 60 * 60 * 1e3,
  sixMonths: 182.5 * 24 * 60 * 60 * 1e3,
  oneYear: 365 * 24 * 60 * 60 * 1e3,

  // helpers
  seconds: (seconds: number) => seconds * 1e3,
  minutes: (minutes: number) => minutes * 60 * 1e3,

  // session here means while the wallet is open
  session: Infinity,
});

// NOTE: to be moved into pairing module once it's implemented
export const supportedCurrencies = freeze({
  ADA: 'ADA',
  BRL: 'BRL',
  BTC: 'BTC',
  CNY: 'CNY',
  ETH: 'ETH',
  EUR: 'EUR',
  JPY: 'JPY',
  KRW: 'KRW',
  USD: 'USD',
} as const);
