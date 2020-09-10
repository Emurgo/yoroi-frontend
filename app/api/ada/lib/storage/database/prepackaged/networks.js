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
import environment from '../../../../../../environment';

export const CardanoForks = Object.freeze({
  Haskell: 0,
  Jormungandr: 1,
});
export const ErgoForks = Object.freeze({
  Primary: 0,
});

export const networks = Object.freeze({
  CardanoMainnet: ({
    NetworkId: 0,
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:8080'
        : 'https://iohk-mainnet.yoroiwallet.com',
      WebSocket: environment.isTest()
        ? 'ws://localhost:8080'
        : 'wss://iohk-mainnet.yoroiwallet.com:443',
    },
    BaseConfig: ([
      Object.freeze({
        StartAt: 0,
        ChainNetworkId: '1',
        ByronNetworkId: 764824073,
        GenesisDate: '1506203091000',
        SlotsPerEpoch: 21600,
        SlotDuration: 20,
      }),
      Object.freeze({
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
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21000' // TODO: pick a port for test
        : 'https://shelley-itn-yoroi-backend.yoroiwallet.com',
      WebSocket: environment.isTest()
        ? 'ws://localhost:21000' // TODO: pick a port for test
        : 'wss://shelley-itn-yoroi-backend.yoroiwallet.com:443',
    },
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
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21001'
        : 'https://ergo-backend.yoroiwallet.com', // TODO
    },
    BaseConfig: ([Object.freeze({
      StartAt: 0,
      ChainNetworkId: (Network.Mainnet.toString(): string),
    })]: ErgoBaseConfig),
    CoinType: CoinTypes.ERGO,
    Fork: ErgoForks.Primary,
  }: NetworkRow),
  CardanoTestnet: ({
    NetworkId: 3_00,
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:8080'
        : 'https://testnet-backend.yoroiwallet.com',
      WebSocket: environment.isTest()
        ? 'ws://localhost:8080'
        : 'wss://testnet-backend.yoroiwallet.com:443',
    },
    BaseConfig: ([
      Object.freeze({
        StartAt: 0,
        ChainNetworkId: '0',
        ByronNetworkId: 1097911063,
        GenesisDate: '1563999616000',
        SlotsPerEpoch: 21600,
        SlotDuration: 20,
      }),
      Object.freeze({
        StartAt: 74,
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
