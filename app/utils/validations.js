// @flow
import BigNumber from 'bignumber.js';
import isInt from 'validator/lib/isInt';
import { TOTAL_SUPPLY } from '../config/numbersConfig';

export const isValidWalletName = (walletName: string) => {
  const nameLength = walletName.length;
  return nameLength >= 1 && nameLength <= 40;
};

export const isValidPaperPassword = (paperPassword: string) => (
  isValidWalletPassword(paperPassword)
);

export const isValidWalletPassword = (walletPassword: string) => (
  // https://xkcd.com/936/
  walletPassword.length >= 12
);

// eslint-disable-next-line max-len
export const isValidRepeatPassword = (
  walletPassword: string,
  repeatPassword: string
) => walletPassword === repeatPassword;

export const isNotEmptyString = (value: string) => value !== '';

export const isValidMemo = (memo: string) => (
  memo !== ''
  && memo.length <= 128
);

export const isValidMemoOptional = (memo: string) => (
  memo.length <= 128
);

export const isValidAmountInLovelaces = (value: string) => {
  const isNumeric = isInt(value, { allow_leading_zeroes: false });
  if (!isNumeric) return false;
  const numericValue = new BigNumber(value);
  const minValue = new BigNumber(1);
  const isValid = numericValue.gte(minValue) && numericValue.lte(TOTAL_SUPPLY);
  return isValid;
};
