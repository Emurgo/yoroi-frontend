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
  app: {
    walletRefreshInterval: 10,
    serverStatusRefreshInterval: 10,
    logsBufferSize: 10,
    logsFileSuffix: 'log',
    addressScanSize: 20,
    addressRequestSize: 20,
    txsBodiesRequestSize: 20,
    coinPriceRefreshInterval: 60000,
    coinPriceFreshnessThreshold: 120000,
    coinPriceRequestRetryDelay: 10000,
    pubKeyData: '',
    pubKeyMaster: '',
  },
};

global.CONFIG = CONFIG;
