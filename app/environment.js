// @flow

import type { ConfigType, Network } from '../config/config-types';
import { NetworkType } from '../config/config-types';
import type { UserAgentInfo } from './utils/userAgentInfo';
import userAgentInfo from './utils/userAgentInfo';
import type { AddressDiscriminationType } from '@emurgo/js-chain-libs/js_chain_libs';
import { RustModule } from './api/ada/lib/cardanoCrypto/rustLoader';

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
    NETWORK: CONFIG.network.name,
    version: getVersion(),
    MOBX_DEV_TOOLS: process.env.MOBX_DEV_TOOLS,
    commit: process.env.COMMIT || '',
    isJest: () => process.env.NODE_ENV === 'jest' || process.env.NODE_ENV === 'test',
    branch: process.env.BRANCH || '',
    isShelley: () => {
      return CONFIG.network.name === NetworkType.SHELLEY_DEV ||
        CONFIG.network.name === NetworkType.SHELLEY_TESTNET;
    },
    isNightly: () => (process.env.NIGHTLY == null ? false : JSON.parse(process.env.NIGHTLY)),
    isTest: () => CONFIG.network.name === NetworkType.TEST,
    isMainnet: () => environment.NETWORK === NetworkType.MAINNET,
    /** Environment used during webpack build */
    isProduction: () => process.env.NODE_ENV === 'production',
    getDiscriminant: () => {
      if (CONFIG.network.name === NetworkType.TEST || process.env.NODE_ENV === 'jest' || process.env.NODE_ENV === 'test') {
        return RustModule.WalletV3.AddressDiscrimination.Production;
      }
      return RustModule.WalletV3.AddressDiscrimination.Test;
    },
    walletRefreshInterval: CONFIG.app.walletRefreshInterval,
    serverStatusRefreshInterval: CONFIG.app.serverStatusRefreshInterval,
    userAgentInfo,
  }
): {
    NETWORK: Network,
    version: string,
    MOBX_DEV_TOOLS: ?string,
    commit: string,
    branch: string,
    isJest: void => boolean,
    isShelley: void => boolean,
    isNightly: void => boolean,
    isTest: void => boolean,
    isMainnet: void => boolean,
    isProduction: void => boolean,
    getDiscriminant: void => AddressDiscriminationType,
    walletRefreshInterval: number,
    serverStatusRefreshInterval: number,
    userAgentInfo: UserAgentInfo,
    ...
});

export default environment;
