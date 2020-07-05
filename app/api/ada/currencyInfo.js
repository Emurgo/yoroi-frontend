// @flow

import BigNumber from 'bignumber.js';

export function getAdaCurrencyMeta(_request: void): {|
  primaryTicker: string,
  decimalPlaces: BigNumber,
  totalSupply: BigNumber,
|} {
  const decimalPlaces = new BigNumber(6);
  return {
    primaryTicker: 'ADA',
    decimalPlaces,
    totalSupply: new BigNumber(
      '45 000 000 000'.replace(/ /g, ''), 10
    )
      .times(new BigNumber(10).pow(decimalPlaces))
  };
}
