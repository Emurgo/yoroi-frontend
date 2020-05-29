// @flow
import BigNumber from 'bignumber.js';
import isInt from 'validator/lib/isInt';
import { MAX_MEMO_SIZE } from '../config/externalStorageConfig';

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
