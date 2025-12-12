import { customAfterEach } from '../../../utils/customHooks.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import SettingsTab from '../../../pages/wallet/settingsTab/settingsTab.page.js';
import SupportSubTab from '../../../pages/wallet/settingsTab/supportSubTab.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { extensionTabName, WindowManager } from '../../../helpers/windowManager.js';

describe('Checking links on Support tab in Settings', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SettingsTab} */
  let settingsPage = null;
  /** @type {SupportSubTab} */
  let supportSubTab = null;
  /** @type {WindowManager} */
  let windowManager = null;

  const expectedData = [
    {
      name: 'FAQ',
      linkInApp: 'https://help.yoroi-wallet.com/en/',
      tabTitle: 'Yoroi FAQ',
      browserLink: 'https://help.yoroi-wallet.com/en/',
      getLinkMethod: 'getFaqLink',
      openLinkMethod: 'openFaqLink',
    },
    {
      name: 'RequestSupport',
      linkInApp: 'https://help.yoroi-wallet.com/en/',
      tabTitle: 'Yoroi FAQ',
      browserLink: 'https://help.yoroi-wallet.com/en/',
      getLinkMethod: 'getRequestSupportLink',
      openLinkMethod: 'openRequestSupportLink',
    },
  ];

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    const wmLogger = getTestLogger('windowManager', this.test.parent.title);
    windowManager = new WindowManager(webdriver, wmLogger);
    await windowManager.init();
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    supportSubTab = new SupportSubTab(webdriver, logger);
  });

  it('Go to Settings Support', async function () {
    await transactionsPage.goToSettingsTab();
    await settingsPage.goToSupportSubMenu();
  });

  for (const testDatum of expectedData) {
    describe(`Check "${testDatum.name}"`, async function () {
      it(`Check ${testDatum.name} link in the app, page title and page url`, async function () {
        const linkInApp = await supportSubTab[testDatum.getLinkMethod]();
        expect(linkInApp, `"${testDatum.name}" link in app is incorrect`).to.equal(testDatum.linkInApp);
        await supportSubTab[testDatum.openLinkMethod]();
        await windowManager.findNewWindowAndSwitchTo(testDatum.tabTitle);
        const titleIsCorrect = await windowManager.waitTitleEquals(testDatum.tabTitle);
        expect(titleIsCorrect, 'The Buy provider page title is not correct').to.be.true;
        const pageUrl = await windowManager.getCurrentUrl();
        expect(pageUrl, 'The page URL is not correct').to.be.equal(testDatum.browserLink);
      });

      afterEach(async function () {
        await windowManager.closeTabWindow(testDatum.tabTitle, extensionTabName);
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
