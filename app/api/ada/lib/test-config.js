// @flow
import type { ConfigType } from '../../../../config/config-types';

const CONFIG: ConfigType = {
  network: {
    protocolMagic: 764824073,
    backendUrl: '',
    websocketUrl: '',
    name: 'mainnet'
  },
  seiza: {
    simple: '',
    advance: ''
  },
  app: {
    walletRefreshInterval: 10,
    serverStatusRefreshInterval: 10,
    logsBufferSize: 10,
    logsFileSuffix: 'log',
    addressRequestSize: 20,
    txsBodiesRequestSize: 20,
  },
  genesis: {
    block0_date: 0,
    slots_per_epoch: 21600,
    slot_duration: 20,
    epoch_reward: 21414,
    linearFee: {
      constant: '155381',
      coefficient: '1',
      certificate: '4'
    },
    genesisHash: 'c511043dda377d7764d9f01d721ddea323f2a01b1e89f62c8ee587a65d7a1487',
  }
};

global.CONFIG = CONFIG;
