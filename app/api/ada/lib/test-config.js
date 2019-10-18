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
    linearFee: {
      constant: '2',
      coefficient: '1',
      certificate: '4'
    },
    genesisHash: 'adbdd5ede31637f6c9bad5c271eec0bc3d0cb9efb86a5b913bb55cba549d0770',
  },
};

global.CONFIG = CONFIG;
