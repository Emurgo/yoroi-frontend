// @flow

import BigNumber from 'bignumber.js';
import { RustModule } from '../ada/lib/cardanoCrypto/rustLoader';

export function getErgoCurrencyMeta(_request: void): {|
  primaryTicker: string,
  decimalPlaces: BigNumber,
  totalSupply: BigNumber,
|} {
  const decimalPlaces = new BigNumber(
    RustModule.SigmaRust.BoxValue.UNITS_PER_ERGO().to_str().length - 1
  );
  return {
    primaryTicker: 'ERG',
    decimalPlaces,
    totalSupply: new BigNumber(
      '97 739 924'.replace(/ /g, ''), 10
    )
      .times(new BigNumber(10).pow(decimalPlaces))
  };
}
