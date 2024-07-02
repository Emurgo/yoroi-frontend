import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import driversPoolsManager from '../utils/driversPool.js';
import AddNewWallet from '../pages/addNewWallet.page.js';

describe('Deleting a memo', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  const oldMemo = 'j1hKEo4Er4FDLFAtGBo07jIcXBSOqx9D16U0sUIl';

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
  });

  it('Prepare DB and storages', async function () {
    const addWalletPage = new AddNewWallet(webdriver, logger);
    const state = await addWalletPage.isDisplayed();
    expect(state).to.be.true;
    await addWalletPage.prepareDBAndStorage('testWallet1MemoAdded');
    await addWalletPage.refreshPage();
  });

  it('Check transactions page', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.waitPrepareWalletBannerIsClosed();
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
  });

  // check the default state. The balance should be displayed
  // click hide balance
  // check balance on the the top bar wallet info panel
  // check balance in a collapsed tx
  // check balance in an expanded tx
  // check balance on Receive tab
  // add checking Staking page when testnetwork is added

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
