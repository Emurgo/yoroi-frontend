import { expect } from 'chai';
import AddNewWallet from '../../../pages/addNewWallet.page.js';
import CreateWalletStepOne from '../../../pages/newWalletPages/createWalletSteps/createWalletStepOne.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { preloadBrowserStorage } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { WindowManager } from '../../../helpers/windowManager.js';

describe('Check learn more on Create wallet step one', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {AddNewWallet} */
  let addNewWalletPage = null;
  /** @type {CreateWalletStepOne} */
  let createWalletStepOnePage = null;
  /** @type {WindowManager} */
  let windowManager = null;

  const expectedDatum = {
    name: 'Learn more',
    linkInApp: 'https://help.yoroi-wallet.com/en/',
    tabTitle: 'Yoroi FAQ',
    browserLink: 'https://help.yoroi-wallet.com/en/',
  };

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await preloadBrowserStorage(webdriver, logger);
    const wmLogger = getTestLogger('windowManager', this.test.parent.title);
    windowManager = new WindowManager(webdriver, wmLogger);
    await windowManager.init();
    addNewWalletPage = new AddNewWallet(webdriver, logger);
    createWalletStepOnePage = new CreateWalletStepOne(webdriver, logger);
  });

  it('Selecting Create wallet', async function () {
    await addNewWalletPage.selectCreateNewWallet();
    const stepOneIsDisplayed = await createWalletStepOnePage.isDisplayed();
    expect(stepOneIsDisplayed, 'The create wallet step one is not displayed').to.be.true;
  });

  it('Check displayed FAQ link', async function () {
    const linkInApp = await createWalletStepOnePage.getLearnMoreLink();
    expect(linkInApp, `"${expectedDatum.name}" link in app is incorrect`).to.equal(expectedDatum.linkInApp);
  });

  it('Open link and check page title', async function () {
    await createWalletStepOnePage.openLearMoreLink();
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
    await createWalletStepOnePage.closeBrowser();
  });
});
