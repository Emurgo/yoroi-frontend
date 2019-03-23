import BigNumber from 'bignumber.js';
import isInt from 'validator/lib/isInt';
import { TOTAL_SUPPLY } from '../config/numbersConfig';

export const isValidWalletName = (walletName) => {
  const nameLength = walletName.length;
  return nameLength >= 1 && nameLength <= 40;
};

export const isValidPaperPassword = (paperPassword) => (
  isValidWalletPassword(paperPassword)
);

export const isValidWalletPassword = (walletPassword) => (
  // https://xkcd.com/936/
  walletPassword.length >= 12
);

// eslint-disable-next-line max-len
export const isValidRepeatPassword = (walletPassword, repeatPassword) => walletPassword === repeatPassword;

export const isNotEmptyString = (value) => value !== '';

export const isValidAmountInLovelaces = (value: string) => {
  const isNumeric = isInt(value, { allow_leading_zeroes: false });
  if (!isNumeric) return false;
  const numericValue = new BigNumber(value);
  const minValue = new BigNumber(1);
  const isValid = numericValue.gte(minValue) && numericValue.lte(TOTAL_SUPPLY);
  return isValid;
};
