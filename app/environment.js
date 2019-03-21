// @flow
import os from 'os';
import type { ConfigType, Network } from '../config/config-types';
import { NetworkType } from '../config/config-types';

declare var CONFIG: ConfigType;

declare type Currency = 'ada';

export const environment = (Object.assign({
  /** Network used to connect */
  NETWORK: CONFIG.network.name,
  version: require('../chrome/manifest.' + CONFIG.network.name + '.json').version,
  /** Environment used during webpack build */
  current: process.env.NODE_ENV,

  API: ('ada': Currency), // Note: can't change at runtime
  MOBX_DEV_TOOLS: process.env.MOBX_DEV_TOOLS,
  commit: process.env.COMMIT || '',
  isDev: () => environment.current === NetworkType.DEVELOPMENT,
  isTest: () => environment.current === NetworkType.TEST,
  isMainnet: () => environment.NETWORK === NetworkType.MAINNET,
  isAdaApi: () => environment.API === 'ada',
  platform: os.platform(),
  walletRefreshInterval: CONFIG.app.walletRefreshInterval,
}, process.env): {
  NETWORK: Network,
  version: string,
  current: ?string,
  API: Currency,
  MOBX_DEV_TOOLS: ?string,
  commit: string,
  isDev: void => boolean,
  isTest: void => boolean,
  isMainnet: void => boolean,
  isAdaApi: void => boolean,
  platform: string,
  walletRefreshInterval: number
});

export default environment;
