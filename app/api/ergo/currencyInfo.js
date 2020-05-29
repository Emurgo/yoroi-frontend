// @flow

import BigNumber from 'bignumber.js';
import { unitsInOneErgo } from '@coinbarn/ergo-ts/dist/constants';

export function getErgoCurrencyMeta(_request: void): {|
  primaryTicker: string,
  unitName: string,
  decimalPlaces: BigNumber,
  totalSupply: BigNumber,
|} {
  const decimalPlaces = new BigNumber(unitsInOneErgo.toString().length - 1);
  return {
    primaryTicker: 'ERG',
    unitName: 'Erg',
    decimalPlaces,
    totalSupply: new BigNumber(
      '97 739 924'.replace(/ /g, ''), 10
    )
      .times(new BigNumber(10).pow(decimalPlaces))
  };
}
