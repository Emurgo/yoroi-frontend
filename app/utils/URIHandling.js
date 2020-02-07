// @flow

import BigNumber from 'bignumber.js';
import { DECIMAL_PLACES_IN_ADA } from '../config/numbersConfig';
import { isValidAmountInLovelaces } from './validations';

export type UriParams = {|
  address: string,
  amount: BigNumber,
|}
/**
 * retrieves URI parameters following the web+cardano protocol
 */
export const getURIParameters = async (
  uri: string,
  addressValidator: (string => Promise<boolean>)
): Promise<?UriParams> => {
  if (!uri) uri = decodeURIComponent(window.location.href);
  const address = await extractAddress(uri, addressValidator);
  if (address == null) return null;
  const amount = extractAmount(uri);
  if (amount == null) return null;
  return {
    address,
    amount,
  };
};

const extractAddress: (
  string,
  string => Promise<boolean>,
) => Promise<?string> = async (
  uri,
  addressValidator,
) => {
  // consider use of URLSearchParams
  const addressRegex = new RegExp('cardano:([A-HJ-NP-Za-km-z1-9]+)');
  const addressMatch = addressRegex.exec(uri);
  if (addressMatch && addressMatch[1]) {
    if (!await addressValidator(addressMatch[1])) {
      return null;
    }
    return addressMatch[1];
  }
  return null;
};

const extractAmount: (
  string,
) => ?BigNumber = (
  uri,
) => {
  // consider use of URLSearchParams
  const amountRegex = new RegExp('amount=([0-9]+\\.?[0-9]*)');
  const amountMatch = amountRegex.exec(uri);
  if (amountMatch && amountMatch[1]) {
    try {
      const asNum = new BigNumber(amountMatch[1]);
      const asString = asNum.shiftedBy(DECIMAL_PLACES_IN_ADA).toString();
      if (!isValidAmountInLovelaces(asString)) {
        return null;
      }
      return asNum;
    } catch (err) {
      return null;
    }
  } else {
    return null;
  }
};

/**
 * builds URI string according to web+cardano protocol
 */
export const buildURI = (
  address: string,
  amount: number
): string => {
  if (amount) return 'web+cardano:' + address + '?amount=' + amount;
  return 'web+cardano:' + address;
};
