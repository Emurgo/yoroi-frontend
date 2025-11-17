// @flow

import type { ConfigType, Network } from '../config/config-types';
import { NetworkType } from '../config/config-types';
import type { UserAgentInfo } from './utils/userAgentInfo';
import userAgentInfo from './utils/userAgentInfo';
import pkg from '../package.json';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

function isChromeProtocol(): boolean {
  return location.protocol === 'chrome-extension:';
}

function isExtension(): boolean {
  return isChromeProtocol();
}

function isChrome(): boolean {
  /**
   * This method returns true for all browser that uses `chrome-extension:` protocol,
   *hence it will return true for browsers like Google Chrome, Brave
   */
  if (isChromeProtocol()) {
    return true;
  }
  // if an extension type that isn't Chrome-based, return false
  if (isExtension()) {
    return false;
  }

  return !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
}

function canRegisterProtocol(): boolean {
  // Can only register a protocol to a website if it's https
  if (!isExtension() && window.location.protocol !== 'https:') {
    return false;
  }
  return true;
}

function getVersion(): string {
  return pkg.version;
}

export const environment = ({
  ...process.env,
  /** Network used to connect */
  getNetworkName: () => CONFIG.network.name,
  getVersion,
  MOBX_DEV_TOOLS: process.env.MOBX_DEV_TOOLS,
  commit: process.env.COMMIT || '',
  isJest: () => process.env.NODE_ENV === 'jest' || process.env.NODE_ENV === 'test',
  branch: process.env.BRANCH || '',
  isDev: () => process.env.NODE_ENV === 'development',
  isNightly: () => (process.env.NIGHTLY == null ? false : JSON.parse(process.env.NIGHTLY)),
  // <TODO:CHECK> light mode legacy
  isLight: Boolean(process.env.IS_LIGHT),
  isTest: () => {
    if (typeof CONFIG === 'undefined') {
      return true;
    }
    return CONFIG.network.name === NetworkType.TEST;
  },
  isE2EBuild: () => Boolean(process.env.IS_E2E),
  isMainnet: () => environment.getNetworkName() === NetworkType.MAINNET,
  /** Environment used during webpack build */
  isProduction: () => process.env.NODE_ENV === 'production',
  getWalletRefreshInterval: () => CONFIG.app.walletRefreshInterval,
  getServerStatusRefreshInterval: () => CONFIG.app.serverStatusRefreshInterval,
  userAgentInfo,
  isChrome,
  isExtension,
  canRegisterProtocol,
}: {
  getNetworkName: void => Network,
  getVersion: void => string,
  MOBX_DEV_TOOLS: ?string,
  commit: string,
  branch: string,
  isJest: void => boolean,
  isDev: void => boolean,
  isNightly: void => boolean,
  isTest: void => boolean,
  isE2EBuild: void => boolean,
  isMainnet: void => boolean,
  isProduction: void => boolean,
  getWalletRefreshInterval: void => number,
  getServerStatusRefreshInterval: void => number,
  userAgentInfo: UserAgentInfo,
  isLight: boolean,
  isExtension: void => boolean,
  isChrome: void => boolean,
  canRegisterProtocol: void => boolean,
  ...
});

export default environment;
