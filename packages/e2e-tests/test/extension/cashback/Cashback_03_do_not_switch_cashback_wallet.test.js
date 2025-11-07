import { expect } from 'chai';
import CashbackPage from '../../../pages/wallet/cashback/cashback.page.js';
import CashbackTermsModal from '../../../pages/wallet/cashback/modals/disclaimerModal.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { createWallet, prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import GeneralSubTab from '../../../pages/wallet/settingsTab/generalSubTab.page.js';
import WalletTab from '../../../pages/wallet/walletTab/walletTab.page.js';
import WrongWalletModal from '../../../pages/wallet/cashback/modals/wrongWalletModal.page.js';
import { testWallet1Mainnet } from '../../../utils/testWallets.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Cashback Do Not Switch Cashback Wallet', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {WalletTab} */
  let walletTabPage = null;
  /** @type {GeneralSubTab} */
  let generalSettings = null;
  /** @type {CashbackTermsModal} */
  let termsModal = null;
  /** @type {WrongWalletModal} */
  let wrongWalletModal = null;
  /** @type {CashbackPage} */
  let cashbackPage = null;
  const secondWalletName = 'CashbackTestWallet2';

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
    walletTabPage = new WalletTab(webdriver, logger);
    generalSettings = new GeneralSubTab(webdriver, logger);
    termsModal = new CashbackTermsModal(webdriver, logger);
    wrongWalletModal = new WrongWalletModal(webdriver, logger);
    cashbackPage = new CashbackPage(webdriver, logger);
  });

  it('Restore second wallet', async function () {
    await walletTabPage.addNewWallet();
    await createWallet(webdriver, logger, secondWalletName, false);
  });

  it('Ensure first wallet is set as cashback', async function () {
    await walletTabPage.goToSettingsTab();
    await generalSettings.selectCashbackWallet(testWallet1Mainnet.name);

    const firstWalletIsCashback = await generalSettings.verifyCashbackWalletIsSelected(testWallet1Mainnet.name);
    expect(firstWalletIsCashback, 'First wallet should be set as cashback wallet').to.be.true;
  });

  it('Open Cashback page and decline switching cashback wallet', async function () {
    await walletTabPage.goToCashbackTab();
    await termsModal.acceptDisclaimerAndProceed();
    const modalDisplayed = await wrongWalletModal.isDisplayed();
    expect(modalDisplayed, 'Wrong wallet modal should be displayed').to.be.true;
    await wrongWalletModal.clickSwitchWallet();
    await wrongWalletModal.modalIsClosed();
    expect((await walletTabPage.getSelectedWalletInfo()).name).to.equal(testWallet1Mainnet.name);
  });

  it('Verify cashback wallet remains unchanged', async function () {
    // Navigate back to settings and verify the cashback wallet is still the first wallet
    await cashbackPage.goToSettingsTab();
    const firstWalletIsStillCashback = await generalSettings.verifyCashbackWalletIsSelected(testWallet1Mainnet.name);
    expect(firstWalletIsStillCashback, 'Cashback wallet should remain the first wallet after declining').to.be.true;
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletTabPage.closeBrowser();
  });
});
