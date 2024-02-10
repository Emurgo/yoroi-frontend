// @flow
import BigNumber from 'bignumber.js';
import isInt from 'validator/lib/isInt';
import { MAX_MEMO_SIZE } from '../config/externalStorageConfig';
import type { $npm$ReactIntl$IntlFormat, } from 'react-intl';
import { defineMessages, } from 'react-intl';
import type { TokenRow } from '../api/ada/lib/storage/database/primitives/tables';
import { getTokenName } from '../stores/stateless/tokenHelpers';
import { truncateToken } from './formatters';

export const isValidWalletName: string => boolean = (walletName) => {
  const nameLength = walletName.length;
  return nameLength >= 1 && nameLength <= 40;
};

export const isValidPaperPassword: string => boolean = (paperPassword) => (
  isValidWalletPassword(paperPassword)
);

export const isValidWalletPassword: string => boolean = (walletPassword) => (
  /**
   * No special character requirement: https://xkcd.com/936/
   *
   * We pick 10 letters as the requirement because Daedalus password requirements are:
   * - 10 characters long
   * - 1 uppercase
   * - 1 lowercase
   * - 1 number
   *
   * Since with Shelley both Yoroi and Daedalus use the same mnemonic scheme,
   * many users may have the same wallet in both Daedalus and Yoroi
   * It's easier if we allow them to also have the same password in this case.
   */
  walletPassword.length >= 10
);

// eslint-disable-next-line max-len
export const isValidRepeatPassword: (string, string) => boolean = (
  walletPassword,
  repeatPassword
) => walletPassword === repeatPassword;

export const isNotEmptyString: string => boolean = (value) => value !== '';

export const isValidMemo: string => boolean = (memo) => (
  memo !== ''
  && memo.length <= MAX_MEMO_SIZE
);

export const isValidMemoOptional: string => boolean = (memo) => (
  memo.length <= MAX_MEMO_SIZE
);

export const isWithinSupply: (string, BigNumber) => boolean = (value, totalSupply) => {
  const isNumeric = isInt(value, { allow_leading_zeroes: false });
  if (!isNumeric) return false;
  const numericValue = new BigNumber(value);
  const minValue = new BigNumber(1);
  const isValid = numericValue.gte(minValue) && numericValue.lte(totalSupply);
  return isValid;
};

/**
 * Calculate the max number of digits we should allow
 * in an input box before the decimal separator
 * ex: 123.45 would be allowed with max digits of 3
 */
export function calcMaxBeforeDot(
  numberOfDecimals: number
): number {
  // some WASM bindings are backed by signed 64-bit numbers
  const max64 = new BigNumber(2).pow(63).minus(1);

  return max64
    // recall: when converting to a WASM object,
    // the decimal is included in the unit
    // ex: 123.45 -> 12345
    // so we need to make sure we're below 2^63 - 1 including the # of decimals
    .div(new BigNumber(10).pow(numberOfDecimals))
    .toFixed(0) // cut off any decimals from division
    // remove 1 because 2^63 - 1 is not exactly divisible by 10
    // ex: if the limit was 2^7 - 1 (127)
    // we would need to disallow 3-digit numbers to make sure 999 can't be inputted
    .length - 1;
}

export async function validateAmount(
  amount: BigNumber,
  tokenRow: $ReadOnly<TokenRow>,
  minAmount: BigNumber,
  formatter: $npm$ReactIntl$IntlFormat,
): Promise<[boolean, void | string]> {
  const messages = defineMessages({
    invalidAmount: {
      id: 'wallet.send.form.errors.invalidAmount',
      defaultMessage: '!!!Invalid amount. Please retype.',
    },
    tooSmallUtxo: {
      id: 'wallet.send.form.errors.tooSmallUtxo',
      defaultMessage: '!!!{minUtxo} {ticker} is minimum.',
    },
  });

  // some Rust stuff could overflow after 2^63 - 1
  if (amount.gt(new BigNumber(2).pow(63).minus(1))) {
    return [false, formatter.formatMessage(messages.invalidAmount)]
  }

  // don't validate this for tokens since they have no minimum
  if (!tokenRow.IsDefault) return [true, undefined];

  if (amount.lt(minAmount)) {
    return [
      false,
      formatter.formatMessage(messages.tooSmallUtxo, {
        minUtxo: minAmount.div(new BigNumber(10).pow(tokenRow.Metadata.numberOfDecimals)),
        ticker: truncateToken(getTokenName(tokenRow)),
      })
    ];
  }
  return [true, undefined];
}
