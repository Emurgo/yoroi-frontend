// @flow

import UAParser from 'ua-parser-js';

export class UserAgentInfo {
  // Refer: Refer: https://www.npmjs.com/package/ua-parser-js
  ua: UAParser.getResult;
  isChromeExtension: boolean;
  isFirefoxExtension: boolean;

  constructor() {
    this.ua = (new UAParser()).getResult();

    /** This method returns true for all browser that uses `chrome-extension:` protocol,
      * hence it will return true for browsers like Google Chrome, Brave */
    this.isChromeExtension = (location.protocol === 'chrome-extension:');
    this.isFirefoxExtension = (location.protocol === 'moz-extension:');
  }
}

export default new UserAgentInfo();
