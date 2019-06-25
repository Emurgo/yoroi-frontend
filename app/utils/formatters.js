// @flow
import BigNumber from 'bignumber.js';
import { DECIMAL_PLACES_IN_ADA } from '../config/numbersConfig';

export const formattedWalletAmount = (amount: BigNumber): string => (
  amount.toFormat(DECIMAL_PLACES_IN_ADA)
);

/** removes commas */
export const formattedAmountToBigNumber = (amount: string) => {
  const cleanedAmount = amount.replace(/,/g, '');
  return new BigNumber(cleanedAmount !== '' ? cleanedAmount : 0);
};

/**
 * Returns number in lovelaces
 *
 * removes leading zeros
 * ensures `DECIMAL_PLACES_IN_ADA` decimal positions
 * shifts decimal places over to turn into a whole number
 */
export const formattedAmountToNaturalUnits = (amount: string): string => {
  // pad number in the case of missing digits
  const split = amount.split('.');
  if (split.length === 2) {
    const numPlaces = split[1].length;
    amount += '0'.repeat(DECIMAL_PLACES_IN_ADA - numPlaces);
  } else {
    amount += '0'.repeat(DECIMAL_PLACES_IN_ADA);
  }

  const cleanedAmount = amount.replace('.', '').replace(/,/g, '').replace(/^0+/, '');
  return cleanedAmount === '' ? '0' : cleanedAmount;
};

/** removes all trailing zeros */
export const formattedAmountWithoutTrailingZeros = (amount: string): string => (
  amount.replace(/0+$/, '').replace(/\.$/, '')
);
