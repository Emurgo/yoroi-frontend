// @flow

import BigNumber from 'bignumber.js';
import { MultiToken } from '../api/common/lib/MultiToken';
import type { DefaultTokenEntry } from '../api/common/lib/MultiToken';

export type UriParams = {|
  address: string,
  amount: MultiToken,
|}
/**
 * retrieves URI parameters following the web+cardano protocol
 */
export const getURIParameters: (
  string,
  string => Promise<boolean>,
  string => boolean,
  number,
  DefaultTokenEntry
) => Promise<?UriParams> = async (
  uri,
  currencyValidator,
  amountValidator,
  decimalPlaces,
  defaultTokenInfo
) => {
  if (!uri) uri = decodeURIComponent(window.location.href);
  const address = await extractAddress(uri, currencyValidator);
  if (address == null) return null;
  const amount = extractAmount(uri, decimalPlaces, amountValidator);
  if (amount == null) return null;
  return {
    address,
    amount: new MultiToken([{
      identifier: defaultTokenInfo.defaultIdentifier,
      networkId: defaultTokenInfo.defaultNetworkId,
      amount: amount.shiftedBy(decimalPlaces),
    }], defaultTokenInfo),
  };
};

const extractAddress: (
  string,
  string => Promise<boolean>,
) => Promise<?string> = async (
  uri,
  currencyValidator,
) => {
  // consider use of URLSearchParams
  const addressRegex = /cardano:([A-Za-z0-9]+)/;
  const currencyRegex = /(cardano+):/;
  const addressMatch = addressRegex.exec(uri);
  const currencyMatch = currencyRegex.exec(uri);
  if (currencyMatch && currencyMatch[1] && addressMatch && addressMatch[1]) {
    if (!await currencyValidator(currencyMatch[1])) {
      return null;
    }
    return addressMatch[1];
  }
  return null;
};

const extractAmount: (
  string,
  number,
  string => boolean,
) => ?BigNumber = (
  uri,
  decimalPlaces,
  amountValidator,
) => {
  // consider use of URLSearchParams
  const amountRegex = /amount=([0-9]+\.?[0-9]*)/;
  const amountMatch = amountRegex.exec(uri);
  if (amountMatch && amountMatch[1]) {
    try {
      const asNum = new BigNumber(amountMatch[1]);
      const asString = asNum.shiftedBy(decimalPlaces).toString();
      if (!amountValidator(asString)) {
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
  amount: BigNumber
): string => {
  if (amount) return 'web+cardano:' + address + '?amount=' + amount.toString();
  return 'web+cardano:' + address;
};
