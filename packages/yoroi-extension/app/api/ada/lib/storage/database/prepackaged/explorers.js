// @flow

import { networks } from './networks';
import type { ExplorerRow } from '../explorers/tables';

const CardanoMainnetExplorers: Array<$ReadOnly<ExplorerRow>> = [
  {
    ExplorerId: 1_06,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: true,
    Endpoints: {
      address: 'https://cardanoscan.io/address/',
      transaction: 'https://cardanoscan.io/transaction/',
      pool: 'https://cardanoscan.io/pool/',
      stakeAddress: 'https://cardanoscan.io/stakeKey/',
      token: 'https://cardanoscan.io/token/',
    },
    Name: 'CardanoScan',
  },
  {
    ExplorerId: 1_08,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      stakeAddress: 'https://adastat.net/addresses/',
      address: 'https://adastat.net/addresses/',
      transaction: 'https://adastat.net/transactions/',
      pool: 'https://adastat.net/pools/',
    },
    Name: 'AdaStat',
  },
  {
    ExplorerId: 1_04,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      address: 'https://explorer.cardano.org/en/address?address=',
      transaction: 'https://explorer.cardano.org/en/transaction?id=',
    },
    Name: 'CardanoExplorer',
  },
  {
    ExplorerId: 1_00,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      stakeAddress: 'https://adaex.org/',
      address: 'https://adaex.org/',
      transaction: 'https://adaex.org/',
      pool: 'https://adapools.org/pool/',
    },
    Name: 'ADAex.org',
  },
  {
    ExplorerId: 1_02,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      address: 'https://blockchair.com/cardano/address/',
      transaction: 'https://blockchair.com/cardano/transaction/',
    },
    Name: 'Blockchair',
  },
  {
    ExplorerId: 1_05,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      stakeAddress: 'https://adapools.org/stake/',
      address: 'https://adapools.org/address/',
      transaction: 'https://adapools.org/transactions/',
      pool: 'https://adapools.org/pool/',
    },
    Name: 'ADApools',
  },
  {
    ExplorerId: 1_07,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      pool: 'https://pooltool.io/pool/',
    },
    Name: 'PoolTool',
  },
];

const JormungandrExplorers: Array<$ReadOnly<ExplorerRow>> = [
  {
    ExplorerId: 2_00,
    NetworkId: networks.JormungandrMainnet.NetworkId,
    IsBackup: true,
    Endpoints: {
      address: 'https://adastat.net/address/',
      transaction: 'https://adastat.net/transaction/',
      pool: 'https://adastat.net/pool/',
    },
    Name: 'AdaStat',
  },
  {
    ExplorerId: 2_01,
    NetworkId: networks.JormungandrMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      address: 'https://itnexplorer.cardano.org/en/address/',
      transaction: 'https://itnexplorer.cardano.org/en/transaction/',
    },
    Name: 'CardanoExplorer',
  },
];

const ErgoExplorers: Array<$ReadOnly<ExplorerRow>> = [
  {
    ExplorerId: 3_00,
    NetworkId: networks.ErgoMainnet.NetworkId,
    IsBackup: true,
    Endpoints: {
      address: 'https://explorer.ergoplatform.com/en/addresses/',
      transaction: 'https://explorer.ergoplatform.com/en/transactions/',
    },
    Name: 'ErgoPlatform',
  },
];

const CardanoTestnetExplorers: Array<$ReadOnly<ExplorerRow>> = [
  {
    ExplorerId: 4_00,
    NetworkId: networks.CardanoTestnet.NetworkId,
    IsBackup: true,
    Endpoints: {
      address: 'https://explorer.cardano-testnet.iohkdev.io/en/address?address=',
      transaction: 'https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=',
    },
    Name: 'CardanoExplorer',
  },
];

const CardanoPreprodTestnetExplorers: Array<$ReadOnly<ExplorerRow>> = [
  {
    ExplorerId: 4_50,
    NetworkId: networks.CardanoPreprodTestnet.NetworkId,
    IsBackup: true,
    Endpoints: {
      address: 'https://testnet.cardanoscan.io/address/',
      transaction: 'https://testnet.cardanoscan.io/transaction/',
      pool: 'https://testnet.cardanoscan.io/pool/',
      stakeAddress: 'https://testnet.cardanoscan.io/stakeKey/',
      token: 'https://testnet.cardanoscan.io/token/',
    },
    Name: 'CardanoScan',
  },
];

const AlonzoTestnetExplorers: Array<$ReadOnly<ExplorerRow>> = [
  {
    ExplorerId: 5_00,
    NetworkId: networks.AlonzoTestnet.NetworkId,
    IsBackup: true,
    Endpoints: {
      address: 'https://explorer.alonzo-white.dev.cardano.org/en/address?address=',
      transaction: 'https://explorer.alonzo-white.dev.cardano.org/en/transaction?id=',
    },
    Name: 'CardanoExplorer',
  },
];

export const prepackagedExplorers: Map<number, $ReadOnlyArray<$ReadOnly<ExplorerRow>>> = new Map([
  [networks.CardanoMainnet.NetworkId, CardanoMainnetExplorers],
  [networks.CardanoTestnet.NetworkId, CardanoTestnetExplorers],
  [networks.CardanoPreprodTestnet.NetworkId, CardanoPreprodTestnetExplorers],
  [networks.JormungandrMainnet.NetworkId, JormungandrExplorers],
  [networks.ErgoMainnet.NetworkId, ErgoExplorers],
  [networks.AlonzoTestnet.NetworkId, AlonzoTestnetExplorers],
]);
const getOrThrow = function<T> (input: ?T): T {
  if (input == null) throw new Error('No backup explorer for type');
  return input;
};
export const prepackagedDefaultExplorers:
  Map<number, $ReadOnly<ExplorerRow>> = new Map([
    [networks.CardanoMainnet.NetworkId, getOrThrow(
      CardanoMainnetExplorers.find(explorer => explorer.IsBackup)
    )],
    [networks.CardanoTestnet.NetworkId, getOrThrow(
      CardanoTestnetExplorers.find(explorer => explorer.IsBackup)
    )],
    [networks.CardanoPreprodTestnet.NetworkId, getOrThrow(
      CardanoTestnetExplorers.find(explorer => explorer.IsBackup)
    )],
    [networks.JormungandrMainnet.NetworkId, getOrThrow(
      JormungandrExplorers.find(explorer => explorer.IsBackup)
    )],
    [networks.ErgoMainnet.NetworkId, getOrThrow(
      ErgoExplorers.find(explorer => explorer.IsBackup)
    )],
    [networks.AlonzoTestnet.NetworkId, getOrThrow(
      AlonzoTestnetExplorers.find(explorer => explorer.IsBackup)
    )],
  ]);
