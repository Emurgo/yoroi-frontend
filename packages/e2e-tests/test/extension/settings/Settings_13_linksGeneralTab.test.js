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

describe('Checking links on General tab in Settings', function () {
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

  const expectedData = [
    {
      name: 'Twitter|X',
      linkInApp: 'https://twitter.com/YoroiWallet',
      getLinkMethod: 'getTwitterLink',
    },
    {
      name: 'YoroiWebsite',
      linkInApp: 'https://yoroi-wallet.com/',
      getLinkMethod: 'getYoroiWebsiteLink',
    },
    {
      name: 'GitHub',
      linkInApp: 'https://github.com/Emurgo/yoroi-frontend',
      getLinkMethod: 'getGithubLink',
    },
  ];

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    generalSubTab = new GeneralSubTab(webdriver, logger);
  });

  it('Open General settings', async function () {
    await transactionsPage.goToSettingsTab();
    await settingsPage.goToGeneralSubMenu();
  });

  for (const testDatum of expectedData) {
    describe(`Check "${testDatum.name}" link`, async function () {
      it(`Check ${testDatum.name} link in the app`, async function () {
        const linkInApp = await generalSubTab[testDatum.getLinkMethod]();
        expect(linkInApp, `"${testDatum.name}" link in app is incorrect`).to.equal(testDatum.linkInApp);
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
