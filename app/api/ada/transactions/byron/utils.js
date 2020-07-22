// @flow

import BigNumber from 'bignumber.js';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { getAdaCurrencyMeta } from '../../currencyInfo';

export function coinToBigNumber(coin: RustModule.WalletV2.Coin): BigNumber {
  const ada = new BigNumber(coin.ada());
  const lovelacesPerAda = new BigNumber(10).pow(getAdaCurrencyMeta().decimalPlaces);
  const lovelace = ada.times(lovelacesPerAda).plus(coin.lovelace());
  return lovelace;
}
