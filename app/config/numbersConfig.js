// @flow
import BigNumber from 'bignumber.js';

export const LOVELACES_PER_ADA = new BigNumber('1 000 000'.replace(/ /g, ''), 10);
export const TOTAL_SUPPLY = new BigNumber('45 000 000 000'.replace(/ /g, ''), 10).times(LOVELACES_PER_ADA);
export const MAX_INTEGER_PLACES_IN_ADA = 11;
export const DECIMAL_PLACES_IN_ADA = 6;
export const MAX_ADA_WALLETS_COUNT = 1;
export const HARD_DERIVATION_START = 0x80000000;
