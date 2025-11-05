import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import SettingsTab from '../../../pages/wallet/settingsTab/settingsTab.page.js';
import WalletSubTab from '../../../pages/wallet/settingsTab/walletSubTab.page.js';
import { getPassword } from '../../../helpers/constants.js';
import { PASSWORDS_DONT_MATCH } from '../../../helpers/messages.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Changing wallet password. Negative. Wrong repeated password', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SettingsTab} */
  let settingsPage = null;
  /** @type {WalletSubTab} */
  let walletSubTabPage = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    walletSubTabPage = new WalletSubTab(webdriver, logger);
  });

  const oldPassword = getPassword();
  const newPass1 = getPassword(10);
  const newPass2 = getPassword(10);

  it('Go to Settings Wallet', async function () {
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
    await transactionsPage.goToSettingsTab();
    await settingsPage.goToWalletSubMenu();
  });
  it('Changing password, correct old one, new passwords dont match', async function () {
    await walletSubTabPage.changeWalletPassword(oldPassword, newPass1, newPass2, true, true);
  });
  it('Checking the error message', async function () {
    const errIsShown = await walletSubTabPage.repeatNewPasswordErrDisplayedAndNotEmpty();
    expect(errIsShown, 'The error is not displayed').to.be.true;
    const realErrMsg = await walletSubTabPage.getRepeatNewPasswordErrorMsg();
    expect(realErrMsg, 'Incorrect error is shown').to.equal(PASSWORDS_DONT_MATCH);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
