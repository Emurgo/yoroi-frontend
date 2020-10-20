// @flow

import { networks } from './networks';
import type { ExplorerRow } from '../explorers/tables';

const CardanoMainnetExplorers: Array<$ReadOnly<ExplorerRow>> = [
  {
    ExplorerId: 1_00,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      address: 'https://adaex.org/',
      transaction: 'https://adaex.org/',
    },
    Name: 'ADAex.org',
  },
  {
    ExplorerId: 1_01,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      address: 'https://adascan.net/address/',
      transaction: 'https://adascan.net/transaction/',
    },
    Name: 'AdaScan',
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
    ExplorerId: 1_03,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
    },
    Name: 'Clio.1',
  },
  {
    ExplorerId: 1_04,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      address: 'https://cardanoexplorer.com/address/',
      transaction: 'https://explorer.cardano.org/en/transaction/',
    },
    Name: 'CardanoExplorer',
  },
  {
    ExplorerId: 1_05,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      transaction: 'https://adapools.org/transactions/',
      pool: 'https://adapools.org/pool/',
    },
    Name: 'AdaPools',
  },
  {
    ExplorerId: 1_06,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: true,
    Endpoints: {
      address: 'https://cardanoscan.io/address/',
      transaction: 'https://cardanoscan.io/transaction/',
      pool: 'https://cardanoscan.io/pool/',
    },
    Name: 'CardanoScan',
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
  {
    ExplorerId: 1_08,
    NetworkId: networks.CardanoMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      address: 'https://adastat.net/addresses/',
      transaction: 'https://adastat.net/transactions/',
      pool: 'https://adastat.net/pools/',
    },
    Name: 'AdaStat',
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
      address: 'https://explorer.cardano-testnet.iohkdev.io/address/',
      transaction: 'https://explorer.cardano-testnet.iohkdev.io/en/transaction/',
    },
    Name: 'CardanoExplorer',
  },
];

export const prepackagedExplorers: Map<number, $ReadOnlyArray<$ReadOnly<ExplorerRow>>> = new Map([
  [networks.CardanoMainnet.NetworkId, CardanoMainnetExplorers],
  [networks.CardanoTestnet.NetworkId, CardanoTestnetExplorers],
  [networks.JormungandrMainnet.NetworkId, JormungandrExplorers],
  [networks.ErgoMainnet.NetworkId, ErgoExplorers],
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
    [networks.JormungandrMainnet.NetworkId, getOrThrow(
      JormungandrExplorers.find(explorer => explorer.IsBackup)
    )],
    [networks.ErgoMainnet.NetworkId, getOrThrow(
      ErgoExplorers.find(explorer => explorer.IsBackup)
    )],
  ]);
