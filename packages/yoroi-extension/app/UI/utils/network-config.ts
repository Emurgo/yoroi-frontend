import { createPrimaryTokenInfo } from '@yoroi/portfolio';
import { Chain, Network } from '@yoroi/types';
import { freeze } from 'immer';

export const primaryTokenInfoMainnet = createPrimaryTokenInfo({
  decimals: 6,
  name: 'ADA',
  ticker: 'ADA',
  symbol: '₳',
  reference: '',
  tag: '',
  website: 'https://www.cardano.org/',
  originalImage: '',
  description: 'Cardano',
});

const primaryTokenInfoAnyTestnet = createPrimaryTokenInfo({
  decimals: 6,
  name: 'TADA',
  ticker: 'TADA',
  symbol: '₳',
  reference: '',
  tag: '',
  website: 'https://www.cardano.org/',
  originalImage: '',
  description: 'Cardano',
});

export const shelleyEraConfig: Readonly<Network.EraConfig> = freeze(
  {
    name: 'shelley',
    start: new Date('2020-07-29T21:44:51.000Z'),
    end: undefined,
    slotInSeconds: 1,
    slotsPerEpoch: 432000,
  },
  true
);

export const byronEraConfig: Readonly<Network.EraConfig> = freeze(
  {
    name: 'byron',
    start: new Date('2017-09-23T21:44:51.000Z'),
    end: new Date('2020-07-29T21:44:51.000Z'),
    slotInSeconds: 20,
    slotsPerEpoch: 21600,
  },
  true
);

export const shelleyPreprodEraConfig: Readonly<Network.EraConfig> = freeze(
  {
    name: 'shelley',
    start: new Date('2022-06-01T01:00:00.000Z'),
    end: undefined,
    slotInSeconds: 1,
    slotsPerEpoch: 432000,
  },
  true
);

export const networkConfigs = {
  0: {
    network: Chain.Network.Mainnet,
    primaryTokenInfo: primaryTokenInfoMainnet,
    chainId: 1,
    protocolMagic: 764_824_073,
    eras: [byronEraConfig, shelleyEraConfig],
    name: 'Mainnet',
    isMainnet: true,

    legacyApiBaseUrl: 'https://api.yoroiwallet.com/api',
  },
  250: {
    network: Chain.Network.Preprod,
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,
    protocolMagic: 1,
    eras: [shelleyPreprodEraConfig],
    name: 'Preprod',
    isMainnet: false,

    legacyApiBaseUrl: 'https://preprod-backend.yoroiwallet.com/api',
  },
  350: {
    network: Chain.Network.Preview,
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,
    protocolMagic: 2,
    eras: [shelleyEraConfig],
    name: 'Preview',
    isMainnet: false,
    legacyApiBaseUrl: 'https://preview-backend.emurgornd.com/api',
  },
};
