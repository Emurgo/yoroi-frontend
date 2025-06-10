// @flow

import type { ConfigType, Network } from '../config/config-types';
import { NetworkType } from '../config/config-types';
import type { UserAgentInfo } from './utils/userAgentInfo';
import userAgentInfo from './utils/userAgentInfo';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
declare var browser;

const IS_FIREFOX_BROWSER_INFO: [boolean | null] = [null];
if (typeof browser !== 'undefined') {
    browser.runtime.getBrowserInfo().then(({ name }) => {
        const isff = name === 'Firefox';
        console.debug(`isFirefox = ${String(isff)} / defined by browser info API`)
        IS_FIREFOX_BROWSER_INFO[0] = isff;
        return null;
    }).catch(e => {
        console.error('failed to call browser info API', e);
    });
}

function isChromeProtocol(): boolean {
    return location.protocol === 'chrome-extension:';
}

function isMozProtocol(): boolean {
    return location.protocol === 'moz-extension:';
}

function isExtension(): boolean {
    return isChromeProtocol() || isMozProtocol();
}

function isFirefox(): boolean {
    if (IS_FIREFOX_BROWSER_INFO[0] != null) {
        return IS_FIREFOX_BROWSER_INFO[0];
    }

    if (isMozProtocol()) {
        return true;
    }
    // if an extension type that isn't Firefox, return false
    if (isExtension()) {
        return false;
    }

    // $FlowExpectedError[cannot-resolve-name] InstallTrigger is a global from the browser
    return typeof InstallTrigger !== 'undefined';
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

    return !!window.chrome
      && (!!window.chrome.webstore || !!window.chrome.runtime)
      && !isFirefox();
}

function canRegisterProtocol(): boolean {
    // Moz-Extension specify the protocol in the manifest not at runtime
    if (isExtension() && isFirefox()) {
        return false;
    }
    // Can only register a protocol to a website if it's https
    if (!isExtension() && window.location.protocol !== 'https:') {
        return false;
    }
    return true;
}

function getVersion(): string {
  const genManifest = require('../chrome/manifest.' + CONFIG.network.name);
  const content = genManifest.default !== undefined
    ? genManifest.default(true)
    : genManifest();

  console.log("yes", CONFIG, content)
  return content.version;
}

const FIREFOX_PRIVACY_POLICY_URL = 'https://addons.mozilla.org/en-US/firefox/addon/yoroi/privacy';

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
    isE2EBuild: () => (Boolean(process.env.IS_E2E)),
    isMainnet: () => environment.getNetworkName() === NetworkType.MAINNET,
    /** Environment used during webpack build */
    isProduction: () => process.env.NODE_ENV === 'production',
    getWalletRefreshInterval: () => CONFIG.app.walletRefreshInterval,
    getServerStatusRefreshInterval: () => CONFIG.app.serverStatusRefreshInterval,
    userAgentInfo,
    isFirefox,
    isChrome,
    isExtension,
    canRegisterProtocol,
    externalPrivacyPolicyURL: () => {
        if (isFirefox()) {
            return FIREFOX_PRIVACY_POLICY_URL;
        }
        return null;
    }
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
  isE2EBuild: void => boolean,
  isMainnet: void => boolean,
  isProduction: void => boolean,
  getWalletRefreshInterval: void => number,
  getServerStatusRefreshInterval: void => number,
  userAgentInfo: UserAgentInfo,
  isLight: boolean,
  isExtension: void => boolean,
  isFirefox: void => boolean,
  isChrome: void => boolean,
  canRegisterProtocol: void => boolean,
  externalPrivacyPolicyURL: void => ?string,
  ...
});

export default environment;
