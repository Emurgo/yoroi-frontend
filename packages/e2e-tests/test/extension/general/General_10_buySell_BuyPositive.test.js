import { customAfterEach } from '../../../utils/customHooks.js';
import BasePage from '../../../pages/basepage.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import BuySell from '../../../pages/buySell/buySell.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { buyTabName, WindowManager } from '../../../helpers/windowManager.js';

describe('Checking Buy workflow redirection', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {BasePage} */
  let basePage = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {BuySell} */
  let buySellPage = null;
  /** @type {WindowManager} */
  let windowManager = null;

  const adaAmount = '100';

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
    const wmLogger = getTestLogger('windowManager', this.test.parent.title);
    windowManager = new WindowManager(webdriver, wmLogger);
    await windowManager.init();
    basePage = new BasePage(webdriver, logger);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    buySellPage = new BuySell(webdriver, logger);
  });

  it('Open the BuySell dialog', async function () {
    await transactionsPage.openBuySellDialog();
    const pageIsDisplayed = await buySellPage.isDisplayed();
    expect(pageIsDisplayed, 'Buy/Sell dialog is not displayed').to.be.true;
  });

  it('Check correct amount entered', async function () {
    await buySellPage.enterAdaAmount(adaAmount);
    const btnEnabled = await buySellPage.isProceedBtnEnabled();
    expect(btnEnabled, 'The proceed button is disabled').to.be.true;
  });

  it('Check the Buy provider page', async function () {
    await buySellPage.proceed();
    await windowManager.findNewWindowAndSwitchTo(buyTabName);
    const title = await windowManager.getCurrentPageTitle();
    expect(title, 'The Buy provider page is not opened').to.be.equal(buyTabName);
    const pageUrl = await windowManager.getCurrentUrl();
    const expectedUrlPart = `https://yoroi.banxa.com/?orderType=buy&fiatType=USD&coinType=ADA&coinAmount=${adaAmount}`;
    expect(pageUrl, 'The page URL is not correct').to.be.a('string').and.satisfy(msg => msg.startsWith(expectedUrlPart));
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
