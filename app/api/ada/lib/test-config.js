// @flow
import type { ConfigType } from '../../../../config/config-types';

const CONFIG: ConfigType = {
  network: {
    protocolMagic: 764824073,
    backendUrl: '',
    websocketUrl: '',
    name: 'mainnet'
  },
  app: {
    walletRefreshInterval: 10,
    serverStatusRefreshInterval: 10,
    logsBufferSize: 10,
    logsFileSuffix: 'log',
    addressRequestSize: 20,
    txsBodiesRequestSize: 20,
  },
};

global.CONFIG = CONFIG;
