import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import TermOfServiceAgreementSubTab from '../pages/wallet/settingsTab/tosSubTab.page.js';
import AddNewWallet from '../pages/addNewWallet.page.js';

describe('Checking Term Of Service Agreement', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
  });

  it('Prepare DB and storages', async function () {
    const addWalletPage = new AddNewWallet(webdriver, logger);
    const state = await addWalletPage.isDisplayed();
    expect(state).to.be.true;
    await addWalletPage.prepareDBAndStorage('testWallet1');
    await addWalletPage.refreshPage();
  });

  it('Check transactions page', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.waitPrepareWalletBannerIsClosed();
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
  });

  it('Open Term Of User Agreement', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.goToSettingsTab();
    const settingsPage = new SettingsTab(webdriver, logger);
    await settingsPage.goToTOSSubMenu();
  });

  it('Checking the Term Of User Agreement page', async function () {
    const tosPage = new TermOfServiceAgreementSubTab(webdriver, logger);
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
