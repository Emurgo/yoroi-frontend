// @flow

import UAParser from 'ua-parser-js';

export class UserAgentInfo {
  // Refer: https://www.npmjs.com/package/ua-parser-js
  ua: { ... };

  isChrome: void => boolean = () => {
    /**
     * This method returns true for all browser that uses `chrome-extension:` protocol,
     *hence it will return true for browsers like Google Chrome, Brave
    */
    if (location.protocol === 'chrome-extension:') {
      return true;
    }
    // if an extension type that isn't Chrome-based, return false
    if (this.isExtension()) {
      return false;
    }

    return !!window.chrome &&
      (!!window.chrome.webstore || !!window.chrome.runtime) &&
      !this.isFirefox();
  };
  isFirefox: void => boolean = () => {
    if (location.protocol === 'moz-extension:') {
      return true;
    }
    // if an extension type that isn't Firefox, return false
    if (this.isExtension()) {
      return false;
    }

    // $FlowExpectedError[cannot-resolve-name] InstallTrigger is a global from the browser
    return typeof InstallTrigger !== 'undefined';
  }
  isExtension: void => boolean = () => {
    return (
      location.protocol === 'chrome-extension:' || location.protocol === 'moz-extension:'
    );
  }

  constructor() {
    this.ua = (new UAParser()).getResult();
  }

  canRegisterProtocol: (() => boolean) = () => {
    // Moz-Extension specify the protocol in the manifest not at runtime
    if (this.isExtension() && this.isFirefox()) {
      return false;
    }
    // Can only register a protocol to a website if it's https
    if (!this.isExtension() && window.location.protocol !== 'https:') {
      return false;
    }
    return true;
  }
}

export default (new UserAgentInfo(): UserAgentInfo);
