// @flow

import {
  CoinTypes,
} from '../../../../../config/numbersConfig';
import { Network } from '@coinbarn/ergo-ts';

export const CardanoForks = Object.freeze({
  Haskell: 0,
  Jormungandr: 1,
});
export const ErgoForks = Object.freeze({
  Primary: 0,
});
export const networks = Object.freeze({
  ByronMainnet: {
    NetworkId: 0,
    NetworkMagic: '764824073',
    CoinType: CoinTypes.CARDANO,
    Fork: CardanoForks.Haskell,
  },
  JormungandrMainnet: {
    NetworkId: 1,
    NetworkMagic: '8e4d2a343f3dcf9330ad9035b3e8d168e6728904262f2c434a4f8f934ec7b676',
    CoinType: CoinTypes.CARDANO,
    Fork: CardanoForks.Jormungandr,
  },
  ErgoMainnet: {
    NetworkId: 2,
    NetworkMagic: (Network.Mainnet.toString(): string),
    CoinType: CoinTypes.ERGO,
    Fork: ErgoForks.Primary,
  },
});
