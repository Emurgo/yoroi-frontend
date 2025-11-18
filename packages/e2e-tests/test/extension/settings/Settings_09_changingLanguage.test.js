import { customAfterEach } from '../../../utils/customHooks.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import SettingsTab from '../../../pages/wallet/settingsTab/settingsTab.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import GeneralSubTab from '../../../pages/wallet/settingsTab/generalSubTab.page.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Changing language through the Settings', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SettingsTab} */
  let settingsPage = null;
  /** @type {GeneralSubTab} */
  let generalSubTab = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    generalSubTab = new GeneralSubTab(webdriver, logger);
  });

  const testData = [
    {
      lang: 'ja-JP',
      btnTransalation: '一般',
    },
    {
      lang: 'ko-KR',
      btnTransalation: '일반',
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
      lang: 'es-ES',
      btnTransalation: 'General',
    },
    {
      lang: 'fr-FR',
      btnTransalation: 'Général',
    },
    {
      lang: 'pt-BR',
      btnTransalation: 'Geral',
    },
    {
      lang: 'id-ID',
      btnTransalation: 'Umum',
    },
    {
      lang: 'vi-VN',
      btnTransalation: 'Chung',
    },
    {
      lang: 'en-US',
      btnTransalation: 'General',
    },
  ];

  it('Open General settings', async function () {
    await transactionsPage.goToSettingsTab();
    await settingsPage.goToGeneralSubMenu();
  });

  for (const testDatum of testData) {
    describe(`Changing language to ${testDatum.lang}`, function () {
      it(`Selecting language ${testDatum.lang}`, async function () {
        await generalSubTab.selectLanguage(testDatum.lang);
      });

      it(`Checking translation on the button ${testDatum.lang}`, async function () {
        const btnText = await settingsPage.getGeneralSubTabText();
        expect(btnText).to.equal(testDatum.btnTransalation);
      });
    });
  }

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
