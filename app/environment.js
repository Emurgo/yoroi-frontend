// @flow

import type { ConfigType, Network } from '../config/config-types';
import { NetworkType } from '../config/config-types';
import type { UserAgentInfo } from './utils/userAgentInfo';
import userAgentInfo from './utils/userAgentInfo';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

declare type Currency = 'ada';

function getVersion(): string {
  const manifest = require('../chrome/manifest.' + CONFIG.network.name);
  const content = manifest.default !== undefined
    ? manifest.default
    : manifest;
  return content.version;
}
export const environment = ((
  {
    ...process.env,
    /** Network used to connect */
    NETWORK: CONFIG.network.name,
    version: getVersion(),
    /** Environment used during webpack build */
    env_type: process.env.NODE_ENV,

    API: ('ada': Currency), // Note: can't change at runtime
    MOBX_DEV_TOOLS: process.env.MOBX_DEV_TOOLS,
    commit: process.env.COMMIT || '',
    isJest: () => process.env.NODE_ENV === 'jest' || process.env.NODE_ENV === 'test',
    branch: process.env.BRANCH || '',
    isDev: () => {
      return CONFIG.network.name === NetworkType.DEVELOPMENT ||
        CONFIG.network.name === NetworkType.SHELLEY_DEV;
    },
    isShelley: () => {
      return CONFIG.network.name === NetworkType.SHELLEY_DEV ||
        CONFIG.network.name === NetworkType.SHELLEY_TESTNET;
    },
    isTest: () => CONFIG.network.name === NetworkType.TEST,
    isMainnet: () => environment.NETWORK === NetworkType.MAINNET ||
      CONFIG.network.name === NetworkType.TEST,
    isAdaApi: () => environment.API === 'ada',
    walletRefreshInterval: CONFIG.app.walletRefreshInterval,
    serverStatusRefreshInterval: CONFIG.app.serverStatusRefreshInterval,
    userAgentInfo,
  }
): {
  NETWORK: Network,
  version: string,
  env_type: ?string,
  API: Currency,
  MOBX_DEV_TOOLS: ?string,
  commit: string,
  branch: string,
  isJest: void => boolean,
  isDev: void => boolean,
  isShelley: void => boolean,
  isTest: void => boolean,
  isMainnet: void => boolean,
  isAdaApi: void => boolean,
  walletRefreshInterval: number,
  serverStatusRefreshInterval: number,
  userAgentInfo: UserAgentInfo
});

export default environment;
