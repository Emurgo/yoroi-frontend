import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';
import AddNewWallet from '../pages/addNewWallet.page.js';

describe('Changing language through the Settings', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(function () {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
  });

  const testData = [
    {
      lang: 'ja-JP',
      btnTransalation: '一般',
    },
    {
      lang: 'zh-Hans',
      btnTransalation: '一般',
    },
    {
      lang: 'ru-RU',
      btnTransalation: 'Общие',
    },
    {
      lang: 'de-DE',
      btnTransalation: 'Allgemein',
    },
    {
      lang: 'pt-BR',
      btnTransalation: 'Geral',
    },
    {
      lang: 'en-US',
      btnTransalation: 'General',
    },
  ];

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

  it('Open General settings', async function () {
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    await transactionsPage.goToSettingsTab();
    const settingsPage = new SettingsTab(webdriver, logger);
    await settingsPage.goToGeneralSubMenu();
  });

  for (const testDatum of testData) {
    describe(`Changing language to ${testDatum.lang}`, function () {
      it('Selecting language', async function () {
        const generalSubTab = new GeneralSubTab(webdriver, logger);
        await generalSubTab.selectLanguage(testDatum.lang);
      });

      it('Checking translation on the button', async function () {
        const settingsPage = new SettingsTab(webdriver, logger);
        const btnText = await settingsPage.getGeneralSubTabText();
        expect(btnText).to.equal(testDatum.btnTransalation);
      });
    });
  }

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
