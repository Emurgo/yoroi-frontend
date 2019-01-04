import type { ConfigType } from '../../../../config/config-types';

const CONFIG: ConfigType = {
  network: {
    protocolMagic: 764824073,
    backendUrl: '',
    websocketUrl: '',
    name: 'mainnet',
    trezorNetwork: 2
  },
  app: {
    walletRefreshInterval: 10,
    logsBufferSize: 10,
    logsFileSuffix: 'log',
    addressScanSize: 20,
    addressRequestSize: 20,
    txsBodiesRequestSize: 20
  },
};

global.CONFIG = CONFIG;
