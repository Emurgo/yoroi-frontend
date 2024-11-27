// @flow

import UAParser from 'ua-parser-js';

export class UserAgentInfo {
  // Refer: https://www.npmjs.com/package/ua-parser-js
  ua: { ... };
  constructor() {
    this.ua = (new UAParser()).getResult();
  }
}

export default (new UserAgentInfo(): UserAgentInfo);
