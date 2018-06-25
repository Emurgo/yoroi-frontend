// @flow
import os from 'os';
import type { ConfigType } from '../config/config-types';

declare var CONFIG: ConfigType;

const environment = Object.assign({
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
  NETWORK: CONFIG.network.name,
  API: process.env.API || 'ada',
  MOBX_DEV_TOOLS: process.env.MOBX_DEV_TOOLS,
  current: process.env.NODE_ENV,
  REPORT_URL: process.env.REPORT_URL || 'http://report-server.awstest.iohkdev.io:8080/',
  isDev: () => environment.current === environment.DEVELOPMENT,
  isTest: () => environment.current === environment.TEST,
  isProduction: () => environment.current === environment.PRODUCTION,
  isMainnet: () => environment.NETWORK === 'mainnet',
  isAdaApi: () => environment.API === 'ada',
  isEtcApi: () => environment.API === 'etc',
  build: process.env.DAEDALUS_VERSION || 'dev',
  platform: os.platform(),
  walletRefreshInterval: CONFIG.app.walletRefreshInterval,
}, process.env);

export default environment;
