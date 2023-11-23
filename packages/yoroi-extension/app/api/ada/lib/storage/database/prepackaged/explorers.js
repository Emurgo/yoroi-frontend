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

const CardanoPreviewTestnetExplorers: Array<$ReadOnly<ExplorerRow>> = [
  {
    ExplorerId: 5_50,
    NetworkId: networks.CardanoPreviewTestnet.NetworkId,
    IsBackup: true,
    Endpoints: {
      address: 'https://preview.cardanoscan.io/address/',
      transaction: 'https://preview.cardanoscan.io/transaction/',
      pool: 'https://preview.cardanoscan.io/pool/',
      stakeAddress: 'https://preview.cardanoscan.io/stakeKey/',
      token: 'https://preview.cardanoscan.io/token/',
    },
    Name: 'CardanoScan',
  },
];

// <TODO:SANCHO FIX WHEN EXPLORER AVAILABLE>
const CardanoSanchoTestnetExplorers: Array<$ReadOnly<ExplorerRow>> = [
  {
    ExplorerId: 6_50,
    NetworkId: networks.CardanoSanchoTestnet.NetworkId,
    IsBackup: true,
    Endpoints: {
      address: 'https://preview.cardanoscan.io/address/',
      transaction: 'https://preview.cardanoscan.io/transaction/',
      pool: 'https://preview.cardanoscan.io/pool/',
      stakeAddress: 'https://preview.cardanoscan.io/stakeKey/',
      token: 'https://preview.cardanoscan.io/token/',
    },
    Name: 'CardanoScan',
  },
];

export const prepackagedExplorers: Map<number, $ReadOnlyArray<$ReadOnly<ExplorerRow>>> = new Map([
  [networks.CardanoMainnet.NetworkId, CardanoMainnetExplorers],
  [networks.CardanoTestnet.NetworkId, CardanoTestnetExplorers],
  [networks.CardanoPreprodTestnet.NetworkId, CardanoPreprodTestnetExplorers],
  [networks.CardanoPreviewTestnet.NetworkId, CardanoPreviewTestnetExplorers],
  [networks.CardanoSanchoTestnet.NetworkId, CardanoSanchoTestnetExplorers],
  // <TODO:PENDING_REMOVAL> Ergo
  [networks.ErgoMainnet.NetworkId, ErgoExplorers],
  // <TODO:PENDING_REMOVAL> Alonzo
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
      CardanoPreprodTestnetExplorers.find(explorer => explorer.IsBackup)
    )],
    [networks.CardanoPreviewTestnet.NetworkId, getOrThrow(
      CardanoPreviewTestnetExplorers.find(explorer => explorer.IsBackup)
    )],
    [networks.CardanoSanchoTestnet.NetworkId, getOrThrow(
      CardanoSanchoTestnetExplorers.find(explorer => explorer.IsBackup)
    )],
  // <TODO:PENDING_REMOVAL> Ergo
    [networks.ErgoMainnet.NetworkId, getOrThrow(
      ErgoExplorers.find(explorer => explorer.IsBackup)
    )],
  // <TODO:PENDING_REMOVAL> Alonzo
    [networks.AlonzoTestnet.NetworkId, getOrThrow(
      AlonzoTestnetExplorers.find(explorer => explorer.IsBackup)
    )],
  ]);
