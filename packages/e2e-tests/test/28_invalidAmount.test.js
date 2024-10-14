import BasePage from '../pages/basepage.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import SendSubTab from '../pages/wallet/walletTab/sendSubTab.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { expect } from 'chai';
import { oneMinute } from '../helpers/timeConstants.js';
import { preloadDBAndStorage, waitTxPage } from '../helpers/restoreWalletHelper.js';
import { NOT_ENOUGH_BALANCE } from '../helpers/messages.js';
import { testWallet1 } from '../utils/testWallets.js';

describe('Invalid amount for sending', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await preloadDBAndStorage(webdriver, logger, 'testWallet1');
    await waitTxPage(webdriver, logger);
  });
  // Go to Send page
  it(`Go to Send page`, async function () {
    const walletPage = new TransactionsSubTab(webdriver, logger);
    await walletPage.goToSendSubMenu();
    const sendPage = new SendSubTab(webdriver, logger);
    const stepOneDisplayed = await sendPage.stepOneIsDisplayed();
    expect(stepOneDisplayed, 'Step one is not displayed').to.be.true;
  });
  // Enter receiver address and continue
  it('Enter receiver address', async function () {
    const sendSubTab = new SendSubTab(webdriver, logger);
    await sendSubTab.enterReceiverAndMemo(testWallet1.receiveAddress);
  });
  // Enter amount
  it('Enter invalid amount', async function () {
    const sendSubTab = new SendSubTab(webdriver, logger);
    await sendSubTab.addAssets(10000, false);
  });
  it(`Check displayed info`, async function () {
    const sendStep1Page = new SendSubTab(webdriver, logger);
    const helperText = await sendStep1Page.getAmountHelperText();
    expect(helperText, 'A different error message is displayed').to.equal(NOT_ENOUGH_BALANCE);
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
