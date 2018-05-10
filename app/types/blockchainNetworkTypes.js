// @flow

export type BlockchainNetworkType = 'MAINNET' | 'TESTNET';

export type BlockchainNetworkConfigType = {
  MAINNET: {
    PROTOCOL_MAGIC: number
  },
  TESTNET: {
    PROTOCOL_MAGIC: number
  }
};
