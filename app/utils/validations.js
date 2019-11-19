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
  /**
   * No special chracter requirement: https://xkcd.com/936/
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
export const isValidRepeatPassword = (
  walletPassword: string,
  repeatPassword: string
) => walletPassword === repeatPassword;

export const isNotEmptyString = (value: string) => value !== '';

export const isValidAmountInLovelaces = (value: string) => {
  const isNumeric = isInt(value, { allow_leading_zeroes: false });
  if (!isNumeric) return false;
  const numericValue = new BigNumber(value);
  const minValue = new BigNumber(1);
  const isValid = numericValue.gte(minValue) && numericValue.lte(TOTAL_SUPPLY);
  return isValid;
};
