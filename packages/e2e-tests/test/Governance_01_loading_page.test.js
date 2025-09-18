import { expect } from 'chai';
import BasePage from '../pages/basepage.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import driversPoolsManager from '../utils/driversPool.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import GovernanceTab from '../pages/wallet/governance/governanceTab.page.js';

describe('Governance page loading', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Open the Governance page', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.goToGovernanceTab();
    const governancePage = new GovernanceTab(webdriver, logger);
    const pageIsDiplayed = await governancePage.isDisplayed();
    expect(pageIsDiplayed, 'The Governance page is not displayed').to.be.true;
  });

  it('Check page is loaded', async function () {
    const governancePage = new GovernanceTab(webdriver, logger);
    const contentIsLoaded = await governancePage.isLoaded();
    expect(contentIsLoaded, 'The Governance page content is not loaded').to.be.true;
  });

  afterEach(async function () {
    customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
  });
});
