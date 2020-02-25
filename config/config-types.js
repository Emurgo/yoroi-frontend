// @flow

export type ConfigType = {|
  network: NetworkConfigType,
  seiza: SeizaConfigType,
  app: AppConfigType,
  genesis: GenesisConfigType,
|};

export type SeizaConfigType = {|
    simpleTemplate: string,
    advanceTemplate: string,
|}

export type AppConfigType = {|
  walletRefreshInterval: number,
  serverStatusRefreshInterval: number,
  logsBufferSize: number,
  logsFileSuffix: string,
  addressRequestSize: number,
  txsBodiesRequestSize: number,
|}

export type NetworkConfigType = {|
  protocolMagic:
  | 764824073 // mainnet protocol magic
  | 1097911063, // testnet protocol magic
  backendUrl: string,
  websocketUrl: string,
  name: Network
|};

export type GenesisConfigType = {|
  linearFee: {|
    constant: string,
    coefficient: string,
    certificate: string,
    per_certificate_fees?: {|
      certificate_pool_registration?: string,
      certificate_stake_delegation?: string,
      certificate_owner_stake_delegation?: string,
    |},
  |},
  /**
   * Reward for a single epoch
   * To avoid rounding errors, this should be an integer
   * ex: 0.0000001 => 1
   */
  epoch_reward: number,
  genesisHash: string,
  block0_date: number,
  slots_per_epoch: number,
  slot_duration: number,
|};

export type Network = 'shelley-dev' | 'shelley-testnet' | 'development' | 'mainnet' | 'testnet' | 'test';
export const NetworkType: {|
  SHELLEY_DEV: Network,
  SHELLEY_TESTNET: Network,
  DEVELOPMENT: Network,
  MAINNET: Network,
  TESTNET: Network,
  TEST: Network,
|} = {
  SHELLEY_DEV: 'shelley-dev',
  SHELLEY_TESTNET: 'shelley-testnet',
  DEVELOPMENT: 'development',
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  TEST: 'test',
};
