import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import driversPoolsManager from '../utils/driversPool.js';

describe('Counting shown NFTs', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWalletNFTs', this);
  });
});
