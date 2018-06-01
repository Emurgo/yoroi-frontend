// @flow

import type {
  BlockchainNetworkType,
  BlockchainNetworkConfigType
} from '../types/blockchainNetworkTypes';

const TESTNET: BlockchainNetworkType = 'TESTNET';
// const MAINNET: BlockchainNetworkType = 'MAINNET';

// TODO: Set the node by configuration settings
export const NETWORK_MODE: BlockchainNetworkType = TESTNET;

export const blockchainNetworkConfig: BlockchainNetworkConfigType = {
  MAINNET: {
    PROTOCOL_MAGIC: 764824073
  },
  TESTNET: {
    PROTOCOL_MAGIC: 633343913
  }
};
