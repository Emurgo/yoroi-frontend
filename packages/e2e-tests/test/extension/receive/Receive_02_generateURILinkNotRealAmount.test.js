import { expect } from 'chai';
import driversPoolsManager from '../../../utils/driversPool.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import ReceiveSubTab from '../../../pages/wallet/walletTab/receiveSubTab.page.js';
import { INVALID_AMOUNT } from '../../../helpers/messages.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Generating URL-link with really big amount', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {ReceiveSubTab} */
  let receivePage = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    receivePage = new ReceiveSubTab(webdriver, logger);
  });

  it('Go to Receive tab', async function () {
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    await transactionsPage.goToReceiveSubMenu();
  });

  it('Generate payment URI', async function () {
    const amountToSend = '40000000000000';
    const generateURIModal = await receivePage.clickGenerateURI(0);
    await generateURIModal.enterReceiveAmount(amountToSend);
  });

  it('Check the error is displayed', async function () {
    const generateURIModal = receivePage.getGenerateURIModal();
    const errorMsg = await generateURIModal.getAmountErrorMessage();
    expect(errorMsg).to.equal(INVALID_AMOUNT);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
