// @flow

import {
  CoinTypes,
} from '../../../../../../config/numbersConfig';
import type {
  NetworkRow,
  CardanoHaskellBaseConfig,
  CardanoHaskellConfig,
  TokenInsert,
} from '../primitives/tables';
import { PRIMARY_ASSET_CONSTANTS } from '../primitives/enums';
import environment from '../../../../../../environment';

export const CardanoForks = Object.freeze({
  Haskell: 0,
});

export const networks = Object.freeze({
  CardanoMainnet: ({
    NetworkId: 0,
    NetworkName: 'Cardano Mainnet',
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21000'
        : 'https://api.yoroiwallet.com',
      TokenInfoService:
        'https://cdn.yoroiwallet.com',
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
        CoinsPerUtxoWord: '34482',
        PoolDeposit: '500000000',
        KeyDeposit: '2000000',
      })
    ]: CardanoHaskellBaseConfig),
    CoinType: CoinTypes.CARDANO,
    Fork: CardanoForks.Haskell,
  }: NetworkRow),
  // <TODO:PENDING_REMOVAL> Legacy Testnet
  CardanoTestnet: ({
    NetworkId: 3_00,
    NetworkName: 'Cardano Legacy Testnet',
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21000'
        : 'https://testnet-backend.yoroiwallet.com',
      TokenInfoService:
        'https://stage-cdn.yoroiwallet.com',
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
        CoinsPerUtxoWord: '34482',
        MinimumUtxoVal: '1000000',
        PoolDeposit: '500000000',
        KeyDeposit: '2000000',
      })
    ]: CardanoHaskellBaseConfig),
    CoinType: CoinTypes.CARDANO,
    Fork: CardanoForks.Haskell,
  }: NetworkRow),
  CardanoPreprodTestnet: ({
    NetworkId: 2_50,
    NetworkName: 'Cardano Preprod Testnet',
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21000'
        : 'https://preprod-backend.yoroiwallet.com',
      TokenInfoService:
        'https://stage-cdn.yoroiwallet.com',
    },
    BaseConfig: ([
      Object.freeze({
        StartAt: 0,
        ChainNetworkId: '0',
        ByronNetworkId: 1,
        GenesisDate: '1654041600000',
        SlotsPerEpoch: 21600,
        SlotDuration: 20,
      }),
      Object.freeze({
        StartAt: 0,
        SlotsPerEpoch: 432000,
        SlotDuration: 1,
        PerEpochPercentageReward: 69344,
        LinearFee: {
          coefficient: '44',
          constant: '155381',
        },
        CoinsPerUtxoWord: '34482',
        MinimumUtxoVal: '1000000',
        PoolDeposit: '500000000',
        KeyDeposit: '2000000',
      })
    ]: CardanoHaskellBaseConfig),
    CoinType: CoinTypes.CARDANO,
    Fork: CardanoForks.Haskell,
  }: NetworkRow),
  CardanoPreviewTestnet: ({
    NetworkId: 3_50,
    NetworkName: 'Cardano Preview Testnet',
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21000'
        : 'https://preview-backend.emurgornd.com',
      TokenInfoService:
        'https://stage-cdn.yoroiwallet.com',
    },
    BaseConfig: ([
      Object.freeze({
        StartAt: 0,
        ChainNetworkId: '0',
        ByronNetworkId: 2,
        GenesisDate: '1666656000000',
        SlotsPerEpoch: 21600,
        SlotDuration: 20,
      }),
      Object.freeze({
        StartAt: 0,
        SlotsPerEpoch: 86400,
        SlotDuration: 1,
        PerEpochPercentageReward: 69344,
        LinearFee: {
          coefficient: '44',
          constant: '155381',
        },
        CoinsPerUtxoWord: '34482',
        MinimumUtxoVal: '1000000',
        PoolDeposit: '500000000',
        KeyDeposit: '2000000',
      })
    ]: CardanoHaskellBaseConfig),
    CoinType: CoinTypes.CARDANO,
    Fork: CardanoForks.Haskell,
  }: NetworkRow),
  CardanoSanchoTestnet: ({
    NetworkId: 4_50,
    NetworkName: 'Cardano Sancho Testnet',
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21000'
        : 'https://sanchonet-backend.yoroiwallet.com',
      TokenInfoService:
        'https://stage-cdn.yoroiwallet.com',
    },
    BaseConfig: ([
      Object.freeze({
        StartAt: 0,
        ChainNetworkId: '0',
        ByronNetworkId: 4,
        GenesisDate: '1686789000000',
        SlotsPerEpoch: 4320,
        SlotDuration: 20,
      }),
      Object.freeze({
        StartAt: 0,
        SlotsPerEpoch: 86400,
        SlotDuration: 1,
        PerEpochPercentageReward: 69344,
        LinearFee: {
          coefficient: '44',
          constant: '155381',
        },
        CoinsPerUtxoWord: '34482',
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
  return network.NetworkId === networks.CardanoTestnet.NetworkId
    || network.NetworkId === networks.CardanoPreprodTestnet.NetworkId
    || network.NetworkId === networks.CardanoPreviewTestnet.NetworkId
    || network.NetworkId === networks.CardanoSanchoTestnet.NetworkId;

}

// <TODO:PENDING_REMOVAL> LEGACY
export function isCardanoHaskell(
  network: $ReadOnly<NetworkRow>,
): boolean {
  return network.CoinType === CoinTypes.CARDANO &&
    network.Fork === CardanoForks.Haskell;

}

export function getCardanoHaskellBaseConfig(
  network: $ReadOnly<NetworkRow>,
): CardanoHaskellBaseConfig {
  if (!isCardanoHaskell(network)) throw new Error(`Incorrect network type ${JSON.stringify(network)}`);
  return (network.BaseConfig: any); // cast to return type
}


export function cardanoHaskellConfigCombine(config: $ReadOnlyArray<CardanoHaskellConfig>): CardanoHaskellConfig {
  // $FlowIgnore[incompatible-exact]
  return (config.reduce((acc, next) => Object.assign(acc, next), {}): CardanoHaskellConfig);
}

export function getCardanoHaskellBaseConfigCombined(
  network: $ReadOnly<NetworkRow>,
): CardanoHaskellConfig {
  return cardanoHaskellConfigCombine(getCardanoHaskellBaseConfig(network))
}

export const defaultAssets: Array<
  $Diff<TokenInsert, {| Digest: number |}>
> = Object.keys(networks)
  .map(key => networks[key])
  .flatMap(network => {
    if (isCardanoHaskell(network)) {
      return [{
        NetworkId: network.NetworkId,
        Identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        IsDefault: true,
        IsNFT: false,
        Metadata: {
          type: 'Cardano',
          policyId: PRIMARY_ASSET_CONSTANTS.Cardano,
          assetName: PRIMARY_ASSET_CONSTANTS.Cardano,
          ticker:
            (network === networks.CardanoTestnet
              || network === networks.CardanoPreprodTestnet
              || network === networks.CardanoPreviewTestnet
              || network === networks.CardanoSanchoTestnet)
              ? 'TADA'
              : 'ADA',
          longName: null,
          numberOfDecimals: 6,
        }
      }];
    }
    throw new Error(`Missing default asset for network type ${JSON.stringify(network)}`);
  });
