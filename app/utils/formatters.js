// @flow
import BigNumber from 'bignumber.js';

export function splitAmount(
  amount: BigNumber,
  decimalPlaces: number,
): [string, string] {
  const valString = amount.toFormat(decimalPlaces);
  const startIndex = valString.length - decimalPlaces;
  return [valString.substring(0, startIndex), valString.substring(startIndex)];
}

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
export const formattedAmountToNaturalUnits: (
  string,
  number
) => string = (amount, decimalPlaces) => {
  // pad number in the case of missing digits
  const split = amount.split('.');
  if (split.length === 2) {
    const numPlaces = split[1].length;
    amount += '0'.repeat(decimalPlaces - numPlaces);
  } else {
    amount += '0'.repeat(decimalPlaces);
  }

  const cleanedAmount = amount.replace('.', '').replace(/,/g, '').replace(/^0+/, '');
  return cleanedAmount === '' ? '0' : cleanedAmount;
};

/** removes all trailing zeros */
export const formattedAmountWithoutTrailingZeros = (amount: string): string => (
  amount.replace(/0+$/, '').replace(/\.$/, '')
);

function truncateFormatter(addr: string, cutoff: number): string {
  const shortener = '...';

  if (addr.length + shortener.length <= cutoff) {
    return addr;
  }
  return addr.substring(0, cutoff / 2) + '...' + addr.substring(addr.length - (cutoff / 2), addr.length);
}

export function truncateToken(addr: string): string {
  return truncateFormatter(addr, 10);
}

export function truncateAddress(addr: string): string {
  // needs to be enough for any bech32 prefix & header and bech32 checksum
  // 40 empirically works well with bech32 and still fits in small spaces and dialogs
  return truncateFormatter(addr, 40);
}

/**
 * Avoid using this when possible
 * Since the length is too small for some bech32 prefixes
 */
export function truncateAddressShort(addr: string): string {
  return truncateFormatter(addr, 20);
}

/**
 * If specified number is integer - append `.0` to it.
 * Otherwise - just float representation.
 */
export function formatBigNumberToFloatString(x: BigNumber): string {
  return x.isInteger() ? x.toFixed(1) : x.toString();
}
