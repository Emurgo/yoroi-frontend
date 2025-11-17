import { customAfterEach } from '../../../utils/customHooks.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import SettingsTab from '../../../pages/wallet/settingsTab/settingsTab.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import TermOfServiceAgreementSubTab from '../../../pages/wallet/settingsTab/tosSubTab.page.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Checking Term Of Service Agreement', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SettingsTab} */
  let settingsPage = null;
  /** @type {TermOfServiceAgreementSubTab} */
  let tosPage = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    tosPage = new TermOfServiceAgreementSubTab(webdriver, logger);
  });

  it('Open Term Of User Agreement', async function () {
    await transactionsPage.goToSettingsTab();
    await settingsPage.goToTOSSubMenu();
  });

  it('Checking the Term Of User Agreement page', async function () {
    const titleIsDisplayed = await tosPage.titleIsDisplayed();
    expect(titleIsDisplayed, 'The title is not displayed').to.be.true;
    const h2Amount = await tosPage.getAmountOfH2();
    // we expect there are 12 <h2> elements which is equal to parts of agreement
    expect(h2Amount).to.equal(12);
    const paragraphsAmount = await tosPage.getAmountOfParagraphs();
    // we expect there are 41 <p> elements
    expect(paragraphsAmount).to.equal(41);
    const allParagraphsNotEmpty = await tosPage.allParagraphsNotEmpty();
    expect(allParagraphsNotEmpty).to.be.true;
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
