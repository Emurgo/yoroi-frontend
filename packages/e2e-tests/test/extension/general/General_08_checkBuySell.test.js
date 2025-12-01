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
import { PROVIDER_BUY, PROVIDER_SELL } from '../../../helpers/messages.js';
import { PROVIDER_BUY_FEE, PROVIDER_SELL_FEE } from '../../../helpers/constants.js';

describe('Checking BuySell dialog', function () {
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

  it('Check components on Buy tab', async function () {
    await buySellPage.selectBuyTab();
    const proceedBtnDisabled = await buySellPage.isProceedBtnDisabled();
    expect(proceedBtnDisabled, 'The Proceed button should be disabled by default').to.be.true;
    const providerInfo = await buySellPage.getProviderInfo();
    expect(providerInfo.name, 'Wrong provider name is displayed on Buy tab').to.be.equal(PROVIDER_BUY);
    expect(providerInfo.fee, 'Wrong provider fee is displayed on Buy tab').to.be.equal(PROVIDER_BUY_FEE);
  });

  it('Check components on Sell tab', async function () {
    await buySellPage.selectSellTab();
    const proceedBtnDisabled = await buySellPage.isProceedBtnDisabled();
    expect(proceedBtnDisabled, 'The Proceed button should be disabled by default').to.be.true;
    const providerInfo = await buySellPage.getProviderInfo();
    expect(providerInfo.name, 'Wrong provider name is displayed on Buy tab').to.be.equal(PROVIDER_SELL);
    expect(providerInfo.fee, 'Wrong provider fee is displayed on Buy tab').to.be.equal(PROVIDER_SELL_FEE);
  });

  it('Close modal', async function () {
    const modalIsClosed = await buySellPage.closeModal();
    expect(modalIsClosed, 'The modal window is not closed').to.be.true;
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
