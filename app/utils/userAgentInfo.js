// @flow

import UAParser from 'ua-parser-js';

export default class UserAgentInfo {
  // Refer: Refer: https://www.npmjs.com/package/ua-parser-js
  ua: UAParser.getResult;

  constructor() {
    this.ua = (new UAParser()).getResult();
  }

  /** This method returns true for all browser that uses `chrome-extension:` protocol,
    * hence it will return true for browsers like Google Chrome, Brave */
  isChromeExtension() {
    return location.protocol === 'chrome-extension:';
  }

  isFirefoxExtension() {
    return location.protocol === 'moz-extension:';
  }
}
