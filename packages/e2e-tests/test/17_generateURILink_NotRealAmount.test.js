import { expect } from 'chai';
import BasePage from '../pages/basepage.js';
import driversPoolsManager from '../utils/driversPool.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { restoreWallet } from '../helpers/restoreWalletHelper.js';
import { getSpendableWallet } from '../utils/testWallets.js';
import ReceiveSubTab from '../pages/wallet/walletTab/receiveSubTab.page.js';
import { INVALID_AMOUNT } from '../helpers/messages.js';

describe('Generating URL-link with really big amount', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(function (done) {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    done();
  });

  it('Restore a 15-word wallet', async function () {
    const testWallet = getSpendableWallet();
    await restoreWallet(webdriver, logger, testWallet);
  });

  it('Go to Receive tab', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    await transactionsPage.goToReceiveSubMenu();
  });

  it('Generate payment URI', async function () {
    const amountToSend = '40000000000000';
    const receivePage = new ReceiveSubTab(webdriver, logger);
    const generateURIModal = await receivePage.clickGenerateURI(0);
    await generateURIModal.enterReceiveAmount(amountToSend);
  });

  it('Check the error is displayed', async function () {
    const receivePage = new ReceiveSubTab(webdriver, logger);
    const generateURIModal = receivePage.getGenerateURIModal();
    const errorMsg = await generateURIModal.getAmountErrorMessage();
    expect(errorMsg).to.equal(INVALID_AMOUNT);
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
