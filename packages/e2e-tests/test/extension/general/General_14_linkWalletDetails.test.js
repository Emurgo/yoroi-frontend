import { customAfterEach } from '../../../utils/customHooks.js';
import AddNewWallet from '../../../pages/addNewWallet.page.js';
import RestoreWalletStepOne from '../../../pages/newWalletPages/restoreWalletSteps/restoreWalletStepOne.page.js';
import RestoreWalletStepTwo from '../../../pages/newWalletPages/restoreWalletSteps/restoreWalletStepTwo.page.js';
import WalletDetails from '../../../pages/newWalletPages/walletDetails.page.js';
import { testWallet1Mainnet } from '../../../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { preloadBrowserStorage } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';
import { WindowManager } from '../../../helpers/windowManager.js';

describe('Check learn more on Wallet details step', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {AddNewWallet} */
  let addNewWalletPage = null;
  /** @type {RestoreWalletStepOne} */
  let restoreWalletStepOnePage = null;
  /** @type {RestoreWalletStepTwo} */
  let restoreWalletStepTwoPage = null;
  /** @type {WalletDetails} */
  let walletDetailsPage = null;
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
    restoreWalletStepOnePage = new RestoreWalletStepOne(webdriver, logger);
    restoreWalletStepTwoPage = new RestoreWalletStepTwo(webdriver, logger);
    walletDetailsPage = new WalletDetails(webdriver, logger);
  });

  it('Selecting Restore wallet 15-word', async function () {
    await addNewWalletPage.selectRestoreWallet();
    await restoreWalletStepOnePage.selectFifteenWordWallet();
  });

  it('Enter the wallet seed phrase', async function () {
    await restoreWalletStepTwoPage.enterRecoveryPhrase15Words(testWallet1Mainnet.mnemonic);
    await restoreWalletStepTwoPage.sleep(100);
    const phraseIsVerified = await restoreWalletStepTwoPage.recoveryPhraseIsVerified();
    expect(phraseIsVerified, 'The recovery phrase is not verified').to.be.true;
    await restoreWalletStepTwoPage.continue();
  });

  it('Check link on wallet details', async function () {
    const linkInApp = await walletDetailsPage.getTipsModalLearMoreLink();
    expect(linkInApp, `"${expectedDatum.name}" link in app is incorrect`).to.equal(expectedDatum.linkInApp);
  });

  it('Open link and check page title', async function () {
    await walletDetailsPage.openTipsModalLearMoreLink();
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
    await addNewWalletPage.closeBrowser();
  });
});
