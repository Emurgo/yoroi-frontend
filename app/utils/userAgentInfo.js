// @flow

import UAParser from 'ua-parser-js';

export default class UserAgentInfo {
  /** Object structured like this:
    * Refer: https://www.npmjs.com/package/ua-parser-js
    * {
    *    ua: "",
    *    browser: {
    *      name: "",
    *      version: ""
    *    },
    *    engine: {
    *      name: "",
    *      version: ""
    *    },
    *    os: {
    *      name: "",
    *      version: ""
    *    },
    *    device: {
    *      model: "",
    *      type: "",
    *      vendor: ""
    *    },
    *    cpu: {
    *      architecture: ""
    *    }
    *  }
    */
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
