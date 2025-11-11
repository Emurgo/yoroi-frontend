import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import SendSubTab from '../../../pages/wallet/walletTab/sendSubTab.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import { getTestLogger } from '../../../utils/utils.js';
import { expect } from 'chai';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { NOT_ENOUGH_BALANCE } from '../../../helpers/messages.js';
import { testWallet1 } from '../../../utils/testWallets.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Invalid amount for sending', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SendSubTab} */
  let sendSubTab = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    sendSubTab = new SendSubTab(webdriver, logger);
  });
  // Go to Send page
  it(`Go to Send page`, async function () {
    await transactionsPage.goToSendSubMenu();
    const stepOneDisplayed = await sendSubTab.stepOneIsDisplayed();
    expect(stepOneDisplayed, 'Step one is not displayed').to.be.true;
  });
  // Enter receiver address and continue
  it('Enter receiver address', async function () {
    await sendSubTab.enterReceiverAndMemo(testWallet1.receiveAddress);
  });
  // Enter amount
  it('Enter invalid amount', async function () {
    await sendSubTab.addAssets('10000', false);
  });
  it(`Check displayed info`, async function () {
    const helperText = await sendSubTab.getAmountHelperText();
    expect(helperText, 'A different error message is displayed').to.equal(NOT_ENOUGH_BALANCE);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
