// @flow

import {
  CoinTypes,
} from '../../../../../../config/numbersConfig';
import { Network } from '@coinbarn/ergo-ts';
import type {
  NetworkRow,
  CardanoHaskellStaticConfig,
  ErgoStaticConfig,
  JormungandrStaticConfig,
} from '../primitives/tables';

export const CardanoForks = Object.freeze({
  Haskell: 0,
  Jormungandr: 1,
});
export const ErgoForks = Object.freeze({
  Primary: 0,
});

export const networks = Object.freeze({
  ByronMainnet: ({
    NetworkId: 1_00,
    StaticConfig: Object.freeze({
      NetworkId: '1',
      ByronNetworkId: 764824073,
    }),
    CoinType: CoinTypes.CARDANO,
    Fork: CardanoForks.Haskell,
  }: NetworkRow),
  JormungandrMainnet: ({
    NetworkId: 2_00,
    StaticConfig: Object.freeze({
      NetworkId: '8e4d2a343f3dcf9330ad9035b3e8d168e6728904262f2c434a4f8f934ec7b676',
      ByronNetworkId: 764824073,
    }),
    CoinType: CoinTypes.CARDANO,
    Fork: CardanoForks.Jormungandr,
  }: NetworkRow),
  ErgoMainnet: ({
    NetworkId: 3_00,
    StaticConfig: Object.freeze({
      NetworkId: (Network.Mainnet.toString(): string),
    }),
    CoinType: CoinTypes.ERGO,
    Fork: ErgoForks.Primary,
  }: NetworkRow),
});

export function isTestnet(
  network: $ReadOnly<NetworkRow>,
): boolean {
  if (network.NetworkId === networks.JormungandrMainnet.NetworkId) return true;
  return false;
}

export function isJormungandr(
  network: $ReadOnly<NetworkRow>,
): boolean {
  if (
    network.CoinType === CoinTypes.CARDANO &&
    network.Fork === CardanoForks.Jormungandr
  ) return true;
  return false;
}
export function isCardanoHaskell(
  network: $ReadOnly<NetworkRow>,
): boolean {
  if (
    network.CoinType === CoinTypes.CARDANO &&
    network.Fork === CardanoForks.Haskell
  ) return true;
  return false;
}
export function isErgo(
  network: $ReadOnly<NetworkRow>,
): boolean {
  if (
    network.CoinType === CoinTypes.ERGO &&
    network.Fork === ErgoForks.Primary
  ) return true;
  return false;
}
export function getCardanoHaskellStaticConfig(
  network: $ReadOnly<NetworkRow>,
): void | CardanoHaskellStaticConfig {
  if (!isCardanoHaskell(network)) return undefined;
  return (network.StaticConfig: any); // cast to return type
}
export function getJormungandrStaticConfig(
  network: $ReadOnly<NetworkRow>,
): void | JormungandrStaticConfig {
  if (!isJormungandr(network)) return undefined;
  return (network.StaticConfig: any); // cast to return type
}
export function getErgoStaticConfig(
  network: $ReadOnly<NetworkRow>,
): void | ErgoStaticConfig {
  if (!isErgo(network)) return undefined;
  return (network.StaticConfig: any); // cast to return type
}
