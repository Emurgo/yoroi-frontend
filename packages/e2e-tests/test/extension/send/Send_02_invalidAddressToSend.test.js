import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import SendSubTab from '../../../pages/wallet/walletTab/sendSubTab.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import { getTestLogger } from '../../../utils/utils.js';
import { expect } from 'chai';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { getTestString } from '../../../helpers/constants.js';
import { INVALID_ADDRESS } from '../../../helpers/messages.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Invalid address for sending', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SendSubTab} */
  let sendPage = null;

  const invalidAddress = getTestString('addr1q', 103);

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    sendPage = new SendSubTab(webdriver, logger);
  });

  it(`Go to Send page`, async function () {
    await transactionsPage.goToSendSubMenu();
    const stepOneDisplayed = await sendPage.stepOneIsDisplayed();
    expect(stepOneDisplayed, 'Step one is not displayed').to.be.true;
  });

  it(`Enter the value`, async function () {
    await sendPage.enterReceiver(invalidAddress);
  });

  it(`Wait and check displayed info`, async function () {
    const errorMessageIsDisplayed = await sendPage.waitReceiverHelperTextEqual(INVALID_ADDRESS);
    expect(errorMessageIsDisplayed, 'A different error message is displayed').to.equal(true);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
