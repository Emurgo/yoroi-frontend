import { customAfterEach } from '../../../utils/customHooks.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import BuySell from '../../../pages/buySell/buySell.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { NOT_ENOUGH_BALANCE } from '../../../helpers/messages.js';

describe('Checking Sell workflow error message', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {BuySell} */
  let buySellPage = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    buySellPage = new BuySell(webdriver, logger);
  });

  it('Open the BuySell dialog', async function () {
    await transactionsPage.openBuySellDialog();
    const pageIsDisplayed = await buySellPage.isDisplayed();
    expect(pageIsDisplayed, 'Buy/Sell dialog is not displayed').to.be.true;
  });

  it('Select the Sell tab', async function () {
    const tabIsSelected = await buySellPage.selectSellTab();
    expect(tabIsSelected, 'The Sell tab is not selected').to.be.true;
  });

  it('Check balance error', async function () {
    await buySellPage.enterAdaAmount('100');
    const helperMessage = await buySellPage.getHelperText();
    expect(helperMessage).to.be.equal(NOT_ENOUGH_BALANCE);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
