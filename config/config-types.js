// @flow

export type ConfigType = {
  network: NetworkConfigType,
  app: AppConfigType,
};

export type AppConfigType = {
  walletRefreshInterval: number,
  logsBufferSize: number,
  logsFileSuffix: string,
  addressScanSize: number,
  addressRequestSize: number
}

export type NetworkConfigType = {
  protocolMagic: 
      633343913  // staging protocol magic
    | 764824073 // mainnet protocol magic
    | 1097911063, // testnet protocol magic
  backendUrl: string,
  websocketUrl: string,
  name: string,
};
