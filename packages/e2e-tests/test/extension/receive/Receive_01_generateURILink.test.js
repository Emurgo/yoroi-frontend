import { expect } from 'chai';
import driversPoolsManager from '../../../utils/driversPool.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import ReceiveSubTab from '../../../pages/wallet/walletTab/receiveSubTab.page.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Generating URL-link', function () {
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

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
