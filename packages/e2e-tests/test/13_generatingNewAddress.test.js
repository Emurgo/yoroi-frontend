import { expect } from 'chai';
import BasePage from '../pages/basepage.js';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestWalletName } from '../helpers/constants.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { createWallet } from '../helpers/restoreWalletHelper.js';
import ReceiveSubTab from '../pages/wallet/walletTab/receiveSubTab.page.js';

describe('Generating a new address', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
  });

  it('Create a 15-word wallet', async function () {
    const walletName = getTestWalletName();
    await createWallet(webdriver, logger, walletName);
  });
  it('Check existing addresses', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    await transactionsPage.goToReceiveSubMenu();
    const receivePage = new ReceiveSubTab(webdriver, logger);
    const addrsAmount = await receivePage.getAmountOfAddresses();
    expect(addrsAmount, 'The amount of addresses is different from expected').to.equal(1);
  });
  it('Generate a new address', async function () {
    const receivePage = new ReceiveSubTab(webdriver, logger);
    await receivePage.generateNewAddress();
  });
  it('Check amount after generating an address', async function () {
    const receivePage = new ReceiveSubTab(webdriver, logger);
    const addrsAmount = await receivePage.getAmountOfAddresses();
    expect(addrsAmount, 'The amount of addresses is different from expected').to.equal(2);
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
