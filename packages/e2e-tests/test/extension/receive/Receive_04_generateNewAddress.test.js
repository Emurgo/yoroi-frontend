import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import BasePage from '../../../pages/basepage.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import ReceiveSubTab from '../../../pages/wallet/walletTab/receiveSubTab.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { getTestWalletName } from '../../../helpers/constants.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { createWallet, preloadBrowserStorage } from '../../../helpers/restoreWalletHelper.js';

describe('Generating a new address', function () {
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
    await preloadBrowserStorage(webdriver, logger);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    receivePage = new ReceiveSubTab(webdriver, logger);
  });

  it('Create a 15-word wallet', async function () {
    const walletName = getTestWalletName();
    await createWallet(webdriver, logger, walletName);
  });
  it('Check existing addresses', async function () {
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    await transactionsPage.goToReceiveSubMenu();
    const addrsAmount = await receivePage.getAmountOfAddresses();
    expect(addrsAmount, 'The amount of addresses is different from expected').to.equal(1);
  });
  it('Generate a new address', async function () {
    await receivePage.generateNewAddress();
  });
  it('Check amount after generating an address', async function () {
    const addrsAmount = await receivePage.getAmountOfAddresses();
    expect(addrsAmount, 'The amount of addresses is different from expected').to.equal(2);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    await basePage.closeBrowser();
  });
});
