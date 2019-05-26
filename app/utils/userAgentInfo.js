// @flow

import UAParser from 'ua-parser-js';

export default class UserAgentInfo {
  ua: UAParser.getResult;

  constructor() {
    this.ua = (new UAParser()).getResult();
  }

  isChromeBrowser() {
    return this.ua.browser.name === 'Chrome';
  }

  isFirefoxBrowser() {
    return this.ua.browser.name === 'Firefox';
  }
}
