// @flow
import type { ConfigType } from '../../../../config/config-types';

const CONFIG: ConfigType = {
  network: {
    name: 'mainnet',
    priceBackendUrl: '',
  },
  poolExplorer: {
    simpleTemplate: '',
  },
  app: {
    walletRefreshInterval: 200000,
    serverStatusRefreshInterval: 200000,
    logsBufferSize: 10,
    logsFileSuffix: 'log',
    addressRequestSize: 50,
    txsBodiesRequestSize: 150,
    coinPriceRefreshInterval: 60000,
    coinPriceFreshnessThreshold: 900000,
    pubKeyData: '',
    pubKeyMaster: '',
  },
};

global.CONFIG = CONFIG;
