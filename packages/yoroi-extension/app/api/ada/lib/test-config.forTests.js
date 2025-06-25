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
  bring: {
    baseUrl: '',
    identifier: '',
    apiEndpoint: ''
  },
  bringSandbox: {
    baseUrl: '',
    identifier: '',
    apiEndpoint: ''
  },
  fcm: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
};

global.CONFIG = CONFIG;
