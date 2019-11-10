// @flow

export type ConfigType = {
  network: NetworkConfigType,
  app: AppConfigType,
};

export type AppConfigType = {
  walletRefreshInterval: number,
  serverStatusRefreshInterval: number,
  logsBufferSize: number,
  logsFileSuffix: string,
  /** Defined by bip44
   * https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#address-gap-limit */
  addressScanSize: number,
  addressRequestSize: number,
  txsBodiesRequestSize: number,
}

export type NetworkConfigType = {
  protocolMagic:
  633343913  // staging protocol magic
  | 764824073 // mainnet protocol magic
  | 1097911063, // testnet protocol magic
  backendUrl: string,
  websocketUrl: string,
  name: Network
};

export type Network = 'development' | 'mainnet' | 'staging' | 'testnet' | 'test';
export const NetworkType: {
  DEVELOPMENT: Network, MAINNET: Network, STAGING: Network, TESTNET: Network, TEST: Network
} = {
  DEVELOPMENT: 'development', MAINNET: 'mainnet', STAGING: 'staging', TESTNET: 'testnet', TEST: 'test',
};
