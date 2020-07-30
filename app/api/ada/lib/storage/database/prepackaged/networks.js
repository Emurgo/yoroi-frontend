// @flow

import {
  CoinTypes,
} from '../../../../../../config/numbersConfig';
import { Network } from '@coinbarn/ergo-ts';
import type {
  NetworkRow,
  CardanoHaskellBaseConfig,
  ErgoBaseConfig,
  JormungandrBaseConfig,
} from '../primitives/tables';

export const CardanoForks = Object.freeze({
  Haskell: 0,
  Jormungandr: 1,
});
export const ErgoForks = Object.freeze({
  Primary: 0,
});

const isMC4 = false;

export const networks = Object.freeze({
  ByronMainnet: ({
    NetworkId: 0,
    BaseConfig: ([
      Object.freeze({
        StartAt: 0,
        ChainNetworkId: '1',
        ByronNetworkId: 764824073,
        GenesisDate: isMC4
          ? '1595682000000'
          : '1506203091000',
        SlotsPerEpoch: 21600,
        SlotDuration: 20,
      }),
      isMC4 ?
        Object.freeze({
          StartAt: 1, // no idea if this is correct
          SlotsPerEpoch: 432000,
          SlotDuration: 1,
          PerEpochPercentageReward: 69344,
          LinearFee: {
            coefficient: '44',
            constant: '155381',
          },
          MinimumUtxoVal: '1000000',
          PoolDeposit: '500000000',
          KeyDeposit: '2000000',
        })
        : Object.freeze({
          StartAt: 208,
          SlotsPerEpoch: 432000,
          SlotDuration: 1,
          PerEpochPercentageReward: 69344,
          LinearFee: {
            coefficient: '44',
            constant: '155381',
          },
          MinimumUtxoVal: '1000000',
          PoolDeposit: '500000000',
          KeyDeposit: '2000000',
        })
    ]: CardanoHaskellBaseConfig),
    CoinType: CoinTypes.CARDANO,
    Fork: CardanoForks.Haskell,
  }: NetworkRow),
  JormungandrMainnet: ({
    NetworkId: 1_00,
    BaseConfig: ([Object.freeze({
      StartAt: 0,
      ChainNetworkId: '8e4d2a343f3dcf9330ad9035b3e8d168e6728904262f2c434a4f8f934ec7b676',
      ByronNetworkId: 764824073,
      GenesisDate: '1576264417000',
      SlotsPerEpoch: 43200,
      SlotDuration: 2,
      PerEpochPercentageReward: 19666,
      LinearFee: {
        constant: '200000',
        coefficient: '100000',
        certificate: '400000',
        per_certificate_fees: {
          certificate_pool_registration: '500000000',
          certificate_stake_delegation: '400000',
        },
      },
    })]: JormungandrBaseConfig),
    CoinType: CoinTypes.CARDANO,
    Fork: CardanoForks.Jormungandr,
  }: NetworkRow),
  ErgoMainnet: ({
    NetworkId: 2_00,
    BaseConfig: ([Object.freeze({
      StartAt: 0,
      ChainNetworkId: (Network.Mainnet.toString(): string),
    })]: ErgoBaseConfig),
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
export function getCardanoHaskellBaseConfig(
  network: $ReadOnly<NetworkRow>,
): CardanoHaskellBaseConfig {
  if (!isCardanoHaskell(network)) throw new Error(`Incorrect network type ${JSON.stringify(network)}`);
  return (network.BaseConfig: any); // cast to return type
}
export function getJormungandrBaseConfig(
  network: $ReadOnly<NetworkRow>,
): JormungandrBaseConfig {
  if (!isJormungandr(network)) throw new Error(`Incorrect network type ${JSON.stringify(network)}`);
  return (network.BaseConfig: any); // cast to return type
}
export function getErgoBaseConfig(
  network: $ReadOnly<NetworkRow>,
): ErgoBaseConfig {
  if (!isErgo(network)) throw new Error(`Incorrect network type ${JSON.stringify(network)}`);
  return (network.BaseConfig: any); // cast to return type
}
