import BasePage from '../pages/basepage.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import SendSubTab from '../pages/wallet/walletTab/sendSubTab.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { expect } from 'chai';
import { oneMinute } from '../helpers/timeConstants.js';
import { preloadDBAndStorage, waitTxPage } from '../helpers/restoreWalletHelper.js';
import { getTestString } from '../helpers/constants.js';
import { INVALID_ADDRESS } from '../helpers/messages.js';

describe('Invalid address for sending', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  const invalidAddress = getTestString('addr1q', 103);

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await preloadDBAndStorage(webdriver, logger, 'testWallet1');
    await waitTxPage(webdriver, logger);
  });

  it(`Go to Send page`, async function () {
    const walletPage = new TransactionsSubTab(webdriver, logger);
    await walletPage.goToSendSubMenu();
    const sendPage = new SendSubTab(webdriver, logger);
    const stepOneDisplayed = await sendPage.stepOneIsDisplayed();
    expect(stepOneDisplayed, 'Step one is not displayed').to.be.true;
  });

  it(`Enter the value`, async function () {
    const sendStep1Page = new SendSubTab(webdriver, logger);
    await sendStep1Page.enterReceiver(invalidAddress);
  });

  it(`Wait for checking`, async function () {
    const sendStep1Page = new SendSubTab(webdriver, logger);
    const errorMarkIsDisplayed = await sendStep1Page.receiverIsIncorrect();
    expect(errorMarkIsDisplayed, 'There is no error for receiver').to.be.true;
  });

  it(`Check displayed info`, async function () {
    const sendStep1Page = new SendSubTab(webdriver, logger);
    const helperText = await sendStep1Page.getReceiverHelperText();
    expect(helperText, 'A different error message is displayed').to.equal(INVALID_ADDRESS);
  });

  afterEach(function (done) {
    customAfterEach(this, webdriver, logger);
    done();
  });

  after(function (done) {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
    done();
  });
});
