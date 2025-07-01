import { Portfolio, Swap } from "@yoroi/types";

export const ordersResultMock: Array<Swap.Order> = [
  {
    status: "open",
    txHash: "1cc1cd024ab0fe2f697a086a566ffefda2acf8dcac05da31af2bb2a6cc12d37a",
    aggregator: "muesliswap",
    outputIndex: 0,
    tokenIn: ".",
    tokenOut: "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e",
    updateTxHash: "1cc1cd024ab0fe2f697a086a566ffefda2acf8dcac05da31af2bb2a6cc12d37a",
    placedAt: 1750848181000,
    amountIn: 1,
    actualAmountOut: 0,
    expectedAmountOut: 10000000000,
    protocol: "minswap-v2"
  },
  {
    actualAmountOut: 0.00037900000000012923,
    aggregator: 'muesliswap',
    amountIn: 1,
    customId: '66cf043794579f05fc204f72',
    expectedAmountOut: 0.000368,
    lastUpdate: 1719137534000,
    outputIndex: 0,
    placedAt: 1719137466000,
    protocol: 'sundaeswap-v1',
    status: 'matched',
    tokenIn:
      'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
    tokenOut: '.',
    txHash: '8751fbef1ebec0d2da9218a69493ef36070012ce24fdbc44ec6df519377b92bf',
    updateTxHash:
      '92bd050ec1da6d25abf6265a6f8318a79a3068459254a79427088407c4241b37',
  },
  {
    actualAmountOut: 5.801912,
    aggregator: 'muesliswap',
    amountIn: 15.330409,
    customId: '66d0e36894579f05fc822e6e',
    expectedAmountOut: 3.756354,
    lastUpdate: 1702736216000,
    outputIndex: 0,
    placedAt: 1702736197000,
    protocol: 'muesliswap-clp',
    status: 'matched',
    tokenIn:
      'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
    tokenOut: '.',
    txHash: 'f7826e21a464939b64274b00033d7ddebbc90924260d30530fdf7a8cd2824d51',
    updateTxHash:
      'a8b77336d8600f1c8dac0ed90d0ab9c4f1e815bb25f4e168aaaadd130f81457d',
  },
  {
    actualAmountOut: 0,
    aggregator: 'dexhunter',
    amountIn: -0.04999999999999982,
    customId: '66cf53aa94579f05fceb90f4',
    expectedAmountOut: 1.889324,
    lastUpdate: 1697122968000,
    outputIndex: 0,
    placedAt: 1697122968000,
    protocol: 'vyfi-v1',
    status: 'canceled',
    tokenIn: '.',
    tokenOut:
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e',
    txHash: '8956d68753d718afbaafde0e83dc1cb1d205da3c89fb08c924ab1d63fd953ed2',
    updateTxHash:
      '6f176b9e1cdbcecafc6c3d80735ec031b125eca19f9bccb57a0a96604e4f539a',
  },
];

export const primaryTokenInfo: Portfolio.Token.Info = {
  id: '.',
  type: Portfolio.Token.Type.FT,
  nature: Portfolio.Token.Nature.Primary,
  decimals: 6,
  ticker: 'ADA',
  name: 'Cardano',
  symbol: 'ADA',
  status: Portfolio.Token.Status.Valid,
  application: Portfolio.Token.Application.Coin,
  tag: '',
  reference: '',
  fingerprint: '',
  description: '',
  website: '',
  originalImage: '',
};

export const tokensResult: Array<Portfolio.Token.Info> = [
  primaryTokenInfo,
  {
    application: Portfolio.Token.Application.General,
    decimals: 0,
    description: '',
    fingerprint: '',
    id: 'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
    name: 'Fake Token',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'FTN',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
  {
    application: Portfolio.Token.Application.General,
    decimals: 6,
    description: '',
    fingerprint: '',
    id: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e',
    name: 'BTN',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'BTN',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
];

export const tokensListMock: Record<string, Portfolio.Token.Info> = {
  '.': primaryTokenInfo,
  '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': {
    application: Portfolio.Token.Application.General,
    decimals: 6,
    description: '',
    fingerprint: '',
    id: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e',
    name: 'BTN',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: 'https://tokens.muesliswap.com/static/img/tokens/2441ab3351c3b80213a98f4e09ddcf7dabe4879c3c94cc4e7205cb63.46495245_scaled_100.webp',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'BTN',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
  'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950': {
    application: Portfolio.Token.Application.General,
    decimals: 0,
    description: '',
    fingerprint: '',
    id: 'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
    name: 'Fake Token',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: 'https://tokens.muesliswap.com/static/img/tokens/2441ab3351c3b80213a98f4e09ddcf7dabe4879c3c94cc4e7205cb63.46495245_scaled_100.webp',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'FTN',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
};

export const defaultTokenInfo = {
  decimals: 6,
  logo: undefined,
  name: "ADA",
  ticker: "ADA",
}

export const selectedExplorer = {
  selected: {
    ExplorerId: 106,
    NetworkId: 0,
    IsBackup: true,
    Endpoints: {
      address: "https://cardanoscan.io/address/",
      transaction: "https://cardanoscan.io/transaction/",
      pool: "https://cardanoscan.io/pool/",
      stakeAddress: "https://cardanoscan.io/stakeKey/",
      token: "https://cardanoscan.io/token/"
    },
    Name: "CardanoScan"
  },
  backup: {
    ExplorerId: 106,
    NetworkId: 0,
    IsBackup: true,
    Endpoints: {
      address: "https://cardanoscan.io/address/",
      transaction: "https://cardanoscan.io/transaction/",
      pool: "https://cardanoscan.io/pool/",
      stakeAddress: "https://cardanoscan.io/stakeKey/",
      token: "https://cardanoscan.io/token/",
    },
    Name: "CardanoScan",
  },
}