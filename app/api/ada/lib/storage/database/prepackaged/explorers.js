// @flow

import { networks } from './networks';
import type { ExplorerRow } from '../explorers/tables';

const ByronExplorers: Array<$ReadOnly<ExplorerRow>> = [
  {
    ExplorerId: 1_00,
    NetworkId: networks.ByronMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      address: 'https://adaex.org/',
      transaction: 'https://adaex.org/',
      pool: 'https://adaex.org/',
    },
    Name: 'ADAex.org',
  },
  {
    ExplorerId: 1_01,
    NetworkId: networks.ByronMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      address: 'https://adascan.net/address/',
      transaction: 'https://adascan.net/transaction/',
    },
    Name: 'AdaScan',
  },
  {
    ExplorerId: 1_02,
    NetworkId: networks.ByronMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      address: 'https://blockchair.com/cardano/address/',
      transaction: 'https://blockchair.com/cardano/transaction/',
    },
    Name: 'Blockchair',
  },
  {
    ExplorerId: 1_03,
    NetworkId: networks.ByronMainnet.NetworkId,
    IsBackup: false,
    Endpoints: {
      address: 'https://clio.one/tracker/address/',
    },
    Name: 'Clio.1',
  },
  {
    ExplorerId: 1_04,
    NetworkId: networks.ByronMainnet.NetworkId,
    IsBackup: true,
    Endpoints: {
      address: 'https://cardanoexplorer.com/address/',
      transaction: 'https://explorer.cardano.org/en/transaction/',
    },
    Name: 'CardanoExplorer',
  },
];

const JormungandrExplorers: Array<$ReadOnly<ExplorerRow>> = [
  {
    ExplorerId: 2_00,
    NetworkId: networks.JormungandrMainnet.NetworkId,
    IsBackup: false,
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
    IsBackup: true,
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

export const prepackagedExplorers: Map<number, $ReadOnlyArray<$ReadOnly<ExplorerRow>>> = new Map([
  [networks.ByronMainnet.NetworkId, ByronExplorers],
  [networks.JormungandrMainnet.NetworkId, JormungandrExplorers],
  [networks.ErgoMainnet.NetworkId, ErgoExplorers],
]);
const getOrThrow = function<T> (input: ?T): T {
  if (input == null) throw new Error('No backup explorer for type');
  return input;
};
export const prepackagedDefaultExplorers:
  Map<number, $ReadOnly<ExplorerRow>> = new Map([
    [networks.ByronMainnet.NetworkId, getOrThrow(
      ByronExplorers.find(explorer => explorer.IsBackup)
    )],
    [networks.JormungandrMainnet.NetworkId, getOrThrow(
      JormungandrExplorers.find(explorer => explorer.IsBackup)
    )],
    [networks.ErgoMainnet.NetworkId, getOrThrow(
      ErgoExplorers.find(explorer => explorer.IsBackup)
    )],
  ]);
