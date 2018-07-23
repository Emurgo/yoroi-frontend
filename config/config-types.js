// @flow

export type ConfigType = {
  network: NetworkConfigType,
  app: AppConfigType,
};

export type AppConfigType = {
  walletRefreshInterval: number,
  logsBufferSize: number,
  logsFileSuffix: string,
  addressRequestSize: number
}

export type NetworkConfigType = {
  protocolMagic: 633343913 | 764824073,
  backendUrl: string,
  websocketUrl: string,
  name: string,
};
