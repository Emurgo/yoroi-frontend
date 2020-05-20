// @flow
import BigNumber from 'bignumber.js';
import { DECIMAL_PLACES_IN_ADA } from '../config/numbersConfig';

export function splitAmount(
  amount: BigNumber,
): [string, string] {
  const valString = formattedWalletAmount(amount);
  const startIndex = valString.length - DECIMAL_PLACES_IN_ADA;
  return [valString.substring(0, startIndex), valString.substring(startIndex)];
}

export const formattedWalletAmount = (amount: BigNumber): string => (
  amount.toFormat(DECIMAL_PLACES_IN_ADA)
);

export const maxNameLengthBeforeTruncation = 15;
export const truncateLongName: string => string = (walletName) => {
  return walletName.length > maxNameLengthBeforeTruncation
    ? walletName.substring(0, maxNameLengthBeforeTruncation - 3) + '...'
    : walletName;
};

/**
 * Just removes all Lovelaces, without decimal place (does not round off)
 * e.g 3657.9345 => 3657
 * @param {*} amount
 */
export const formattedAmountWithoutLovelace = (amount: BigNumber): string => (
  amount.decimalPlaces(0, 3).toString() // 3 = ROUND_FLOOR
);

/** removes commas */
export const formattedAmountToBigNumber = (amount: string): BigNumber => {
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
