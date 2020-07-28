// @flow
import type { ConfigType } from '../../../../config/config-types';

const CONFIG: ConfigType = {
  network: {
    protocolMagic: 764824073,
    backendUrl: '',
    websocketUrl: '',
    name: 'mainnet',
    priceBackendUrl: '',
  },
  seiza: {
    simpleTemplate: '',
    advanceTemplate: '',
  },
  app: {
    walletRefreshInterval: 10,
    serverStatusRefreshInterval: 10,
    logsBufferSize: 10,
    logsFileSuffix: 'log',
    addressRequestSize: 50,
    txsBodiesRequestSize: 150,
    coinPriceRefreshInterval: 60000,
    coinPriceFreshnessThreshold: 120000,
    pubKeyData: '',
    pubKeyMaster: '',
  },
};

global.CONFIG = CONFIG;
