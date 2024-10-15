// @flow

import type { ConfigType, Network } from '../config/config-types';
import { NetworkType } from '../config/config-types';
import type { UserAgentInfo } from './utils/userAgentInfo';
import userAgentInfo from './utils/userAgentInfo';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

function getVersion(): string {
  const genManifest = require('../chrome/manifest.' + CONFIG.network.name);
  const content = genManifest.default !== undefined
    ? genManifest.default(true)
    : genManifest();
  return content.version;
}

export const environment = ((
  {
    ...process.env,
    /** Network used to connect */
    getNetworkName: () => CONFIG.network.name,
    getVersion,
    MOBX_DEV_TOOLS: process.env.MOBX_DEV_TOOLS,
    commit: process.env.COMMIT || '',
    isJest: () => process.env.NODE_ENV === 'jest' || process.env.NODE_ENV === 'test',
    branch: process.env.BRANCH || '',
    isDev: () => (process.env.NODE_ENV === 'development'),
    isNightly: () => (process.env.NIGHTLY == null ? false : JSON.parse(process.env.NIGHTLY)),
    // <TODO:CHECK> light mode legacy
    isLight: Boolean(process.env.IS_LIGHT),
    isTest: () => {
      if (typeof CONFIG === 'undefined') {
        return true;
      }
      return CONFIG.network.name === NetworkType.TEST;
    },
    isMainnet: () => environment.getNetworkName() === NetworkType.MAINNET,
    /** Environment used during webpack build */
    isProduction: () => process.env.NODE_ENV === 'production',
    getWalletRefreshInterval: () => CONFIG.app.walletRefreshInterval,
    getServerStatusRefreshInterval: () => CONFIG.app.serverStatusRefreshInterval,
    userAgentInfo,
  }
): {
    getNetworkName: void => Network,
    getVersion: void => string,
    MOBX_DEV_TOOLS: ?string,
    commit: string,
    branch: string,
    isJest: void => boolean,
    isDev: void => boolean,
    isNightly: void => boolean,
    isTest: void => boolean,
    isMainnet: void => boolean,
    isProduction: void => boolean,
    getWalletRefreshInterval: void => number,
    getServerStatusRefreshInterval: void => number,
    userAgentInfo: UserAgentInfo,
    isLight: boolean,
    ...
});

export default environment;
