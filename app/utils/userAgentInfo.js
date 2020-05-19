// @flow

import UAParser from 'ua-parser-js';

export class UserAgentInfo {
  // Refer: https://www.npmjs.com/package/ua-parser-js
  ua: UAParser.getResult;

  isChrome: boolean;
  isFirefox: boolean;
  isExtension: boolean;

  constructor() {
    this.ua = (new UAParser()).getResult();

    /** This method returns true for all browser that uses `chrome-extension:` protocol,
      * hence it will return true for browsers like Google Chrome, Brave */
    this.isChrome = (location.protocol === 'chrome-extension:');
    this.isFirefox = (location.protocol === 'moz-extension:');
    if (this.isChrome || this.isFirefox) {
      this.isExtension = true;
      return;
    }

    this.isExtension = false;
    // if running Yoroi in browser mode
    // we need to rely on detecting what features of the API are enabled

    // $FlowFixMe InstallTrigger is a global from the browser
    this.isFirefox = (typeof InstallTrigger !== 'undefined');
    this.isChrome = !!window.chrome &&
      (!!window.chrome.webstore || !!window.chrome.runtime) &&
      !this.isFirefox;
  }

  canRegisterProtocol: (() => boolean) = () => {
    // Moz-Extension specify the protocol in the manifest not at runtime
    if (this.isExtension && this.isFirefox) {
      return false;
    }
    // Can only register a protocol to a website if it's https
    if (!this.isExtension && window.location.protocol !== 'https:') {
      return false;
    }
    return true;
  }
}

export default (new UserAgentInfo(): UserAgentInfo);
