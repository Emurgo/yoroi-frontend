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

describe('Generating URL-link', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(function () {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
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
    const receivePage = new ReceiveSubTab(webdriver, logger);
    const amountToSend = '5';
    
    const genURIInfo = await receivePage.geneneratePaymentURI(0, amountToSend);
    const latestReceiverAddr = await receivePage.getCurrentReceiveAddr();
    expect(latestReceiverAddr).to.equal(genURIInfo.address);

    const [linkHeader, linkBody] = genURIInfo.genLink.split(':');
    expect(linkHeader).to.equal('web+cardano');

    const [addressInLink, amountTextInLink] = linkBody.split('?');
    expect(addressInLink).to.equal(latestReceiverAddr);
    expect(amountTextInLink).to.equal(`amount=${amountToSend}`);
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
