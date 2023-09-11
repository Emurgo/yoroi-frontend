// @flow

import {
  CoinTypes,
} from '../../../../../../config/numbersConfig';
import type {
  NetworkRow,
  CardanoHaskellBaseConfig,
  ErgoBaseConfig,
  TokenInsert,
} from '../primitives/tables';
import { PRIMARY_ASSET_CONSTANTS } from '../primitives/enums';
import environment from '../../../../../../environment';
import { decode, } from 'bs58';

export const CardanoForks = Object.freeze({
  Haskell: 0,
});

export const ErgoForks = Object.freeze({
  Primary: 0,
});

export const networks = Object.freeze({
  CardanoMainnet: ({
    NetworkId: 0,
    NetworkName: 'Cardano Mainnet',
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21000'
        : 'https://iohk-mainnet.yoroiwallet.com',
      WebSocket: environment.isTest()
        ? 'ws://localhost:21000'
        : 'wss://iohk-mainnet.yoroiwallet.com:443',
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
  // <TODO:PENDING_REMOVAL>
  ErgoMainnet: ({
    NetworkId: 2_00,
    NetworkName: 'Ergo Mainnet',
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21001'
        : 'https://ergo-backend.yoroiwallet.com',
    },
    BaseConfig: ([Object.freeze({
      StartAt: 0,
      ChainNetworkId: (
        '0' // RustModule.SigmaRust.NetworkPrefix.Mainnet
      ),
      // TODO: it's more complicated than this since the min value depends on the # of bytes
      MinimumBoxValue: '100000',
      FeeAddress: decode(
        '2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe'
      ).toString('hex'),
    })]: ErgoBaseConfig),
    CoinType: CoinTypes.ERGO,
    Fork: ErgoForks.Primary,
  }: NetworkRow),
  // <TODO:PENDING_REMOVAL>
  CardanoTestnet: ({
    NetworkId: 3_00,
    NetworkName: 'Cardano Legacy Testnet',
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21000'
        : 'https://testnet-backend.yoroiwallet.com',
      WebSocket: environment.isTest()
        ? 'ws://localhost:21000'
        : 'wss://testnet-backend.yoroiwallet.com:443',
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
  // <TODO:PENDING_REMOVAL>
  AlonzoTestnet: ({
    NetworkId: 4_00,
    NetworkName: 'Alonzo Testnet',
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21000'
        : 'https://alonzo-backend.yoroiwallet.com',
      WebSocket: environment.isTest()
        ? 'ws://localhost:21000'
        : 'wss://alonzo-backend.yoroiwallet.com:443',
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
  CardanoPreprodTestnet: ({
    NetworkId: 2_50,
    NetworkName: 'Cardano Preprod Testnet',
    Backend: {
      BackendService: environment.isTest()
        ? 'http://localhost:21000'
        : 'https://preprod-backend.yoroiwallet.com',
      WebSocket: environment.isTest()
        ? 'ws://localhost:21000'
        : 'wss://preprod-backend.yoroiwallet.com:443',
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
      WebSocket: environment.isTest()
        ? 'ws://localhost:21000'
        : 'wss://preview-backend.emurgornd.com:443',
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
});

export function isTestnet(
  network: $ReadOnly<NetworkRow>,
): boolean {
  return network.NetworkId === networks.CardanoTestnet.NetworkId
    || network.NetworkId === networks.CardanoPreprodTestnet.NetworkId
    || network.NetworkId === networks.CardanoPreviewTestnet.NetworkId;

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

export function getErgoBaseConfig(
  network: $ReadOnly<NetworkRow>,
): ErgoBaseConfig {
  if (!isErgo(network)) throw new Error(`Incorrect network type ${JSON.stringify(network)}`);
  return (network.BaseConfig: any); // cast to return type
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
              || network === networks.AlonzoTestnet)
              ? 'TADA'
              : 'ADA',
          longName: null,
          numberOfDecimals: 6,
        }
      }];
    }
    if (isErgo(network)) {
      return [{
        NetworkId: network.NetworkId,
        Identifier: PRIMARY_ASSET_CONSTANTS.Ergo,
        IsDefault: true,
        IsNFT: false,
        Metadata: {
          type: 'Ergo',
          height: 0,
          boxId: PRIMARY_ASSET_CONSTANTS.Ergo,
          ticker: 'ERG',
          longName: null,
          numberOfDecimals: '1000000000'.length - 1, // units per ERG
          description: null,
        }
      }];
    }
    throw new Error(`Missing default asset for network type ${JSON.stringify(network)}`);
  });
