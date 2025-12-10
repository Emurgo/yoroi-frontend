import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import driversPoolsManager from '../../../utils/driversPool.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import GovernanceTab from '../../../pages/wallet/governance/governanceTab.page.js';

describe('Governance page loading _smoke_', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {GovernanceTab} */
  let governancePage = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    governancePage = new GovernanceTab(webdriver, logger);
  });

  it('Open the Governance page', async function () {
    await transactionsPage.goToGovernanceTab();
    const pageIsDiplayed = await governancePage.isDisplayed();
    expect(pageIsDiplayed, 'The Governance page is not displayed').to.be.true;
  });

  it('Check page is loaded', async function () {
    const contentIsLoaded = await governancePage.isLoaded();
    expect(contentIsLoaded, 'The Governance page content is not loaded').to.be.true;
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
