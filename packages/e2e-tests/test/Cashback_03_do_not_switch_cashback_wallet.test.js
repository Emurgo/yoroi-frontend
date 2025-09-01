import { expect } from 'chai';
import BasePage from '../pages/basepage.js';
import CashbackPage from '../pages/wallet/Cashback/cashback.page.js';
import CashbackTermsModal from '../pages/wallet/Cashback/modals/disclaimerModal.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { createWallet, prepareWallet } from '../helpers/restoreWalletHelper.js';
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';
import WalletTab from '../pages/wallet/walletTab/walletTab.page.js';
import WrongWalletModal from '../pages/wallet/Cashback/modals/wrongWalletModal.page.js';
import { testWallet1Mainnet } from '../utils/testWallets.js';

describe('Cashback Do Not Switch Cashback Wallet', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  const secondWalletName = 'CashbackTestWallet2';

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Restore second wallet', async function () {
    const walletTabPage = new WalletTab(webdriver, logger);
    await walletTabPage.addNewWallet();
    await createWallet(webdriver, logger, secondWalletName, false);
  });

  it('Ensure first wallet is set as cashback', async function () {
    const walletTabPage = new WalletTab(webdriver, logger);
    await walletTabPage.goToSettingsTab();

    const generalSettings = new GeneralSubTab(webdriver, logger);
    await generalSettings.selectCashbackWallet(testWallet1Mainnet.name);

    const firstWalletIsCashback = await generalSettings.verifyCashbackWalletIsSelected(testWallet1Mainnet.name);
    expect(firstWalletIsCashback, 'First wallet should be set as cashback wallet').to.be.true;
  });

  it('Open Cashback page and decline switching cashback wallet', async function () {
    const walletTabPage = new WalletTab(webdriver, logger);
    await walletTabPage.goToCashbackTab();
    const termsModal = new CashbackTermsModal(webdriver, logger);
    await termsModal.acceptDisclaimerAndProceed();
    const wrongWalletModal = new WrongWalletModal(webdriver, logger);
    const modalDisplayed = await wrongWalletModal.isDisplayed();
    expect(modalDisplayed, 'Wrong wallet modal should be displayed').to.be.true;
    await wrongWalletModal.clickSwitchWallet();
    await wrongWalletModal.modalIsClosed();
    expect((await walletTabPage.getSelectedWalletInfo()).name).to.equal(testWallet1Mainnet.name);
  });

  it('Verify cashback wallet remains unchanged', async function () {
    // Navigate back to settings and verify the cashback wallet is still the first wallet
    const cashbackPage = new CashbackPage(webdriver, logger);
    await cashbackPage.goToSettingsTab();

    const generalSettings = new GeneralSubTab(webdriver, logger);
    const firstWalletIsStillCashback = await generalSettings.verifyCashbackWalletIsSelected(testWallet1Mainnet.name);
    expect(firstWalletIsStillCashback, 'Cashback wallet should remain the first wallet after declining').to.be.true;
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


