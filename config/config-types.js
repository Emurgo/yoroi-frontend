// @flow

export type ConfigType = {
  network: NetworkConfigType
};

export type NetworkConfigType = {
  protocolMagic: 633343913 | 764824073,
  backendUrl: String
};
