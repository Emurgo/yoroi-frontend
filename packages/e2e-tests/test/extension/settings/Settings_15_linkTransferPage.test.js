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
import { WindowManager } from '../../../helpers/windowManager.js';

describe('Checking link on Transfer page in Settings', function () {
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

  const expectedDatum = {
    name: 'Transfer_FAQ',
    linkInApp: 'https://help.yoroi-wallet.com/en/article/how-to-claim-a-byron-era-wallet-in-yoroi-qdxql3/',
    tabTitle: 'How to claim a Byron-era wallet in Yoroi? | Yoroi FAQ',
    browserLink: 'https://help.yoroi-wallet.com/en/article/how-to-claim-a-byron-era-wallet-in-yoroi-qdxql3/',
  };

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

  it('Go to Settings Support Transfer', async function () {
    await transactionsPage.goToSettingsTab();
    await settingsPage.goToSupportSubMenu();
    await supportSubTab.openTransferPage();
  });

  it(`Check link in the app, page title and page url`, async function () {
    const linkInApp = await supportSubTab.getTransferFaqLink();
    expect(linkInApp, `"${expectedDatum.name}" link in app is incorrect`).to.equal(expectedDatum.linkInApp);
  });

  it('Open link and check page title', async function () {
    await supportSubTab.openTransferFaqLink();
    await windowManager.findNewWindowAndSwitchTo(expectedDatum.tabTitle);
    const titleIsCorrect = await windowManager.waitTitleEquals(expectedDatum.tabTitle);
    expect(titleIsCorrect, `The "${expectedDatum.name}" page title is not correct`).to.be.true;
  });

  it('Check page url', async function () {
    const pageUrl = await windowManager.getCurrentUrl();
    expect(pageUrl, 'The page URL is not correct').to.be.equal(expectedDatum.browserLink);
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
