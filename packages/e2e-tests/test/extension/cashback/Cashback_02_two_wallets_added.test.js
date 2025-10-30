import { expect } from 'chai';
import BasePage from '../../../pages/basepage.js';
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

describe('Cashback Two Wallets Added', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;
  const secondWalletName = 'CashbackTestWallet';

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

  it('Check cashback wallet in settings is not set', async function () {
    const walletTabPage = new WalletTab(webdriver, logger);
    await walletTabPage.goToSettingsTab();

    const generalSettings = new GeneralSubTab(webdriver, logger);
    const selectedWallet = await generalSettings.getSelectedCashbackWallet();
    expect(selectedWallet, 'Some wallet is selected as cashback already').to.equal('');
  });

  it('Set first wallet as a cashback', async function () {
    // Set the first wallet as cashback wallet
    const generalSettings = new GeneralSubTab(webdriver, logger);
    await generalSettings.selectCashbackWallet(testWallet1Mainnet.name);

    // Verify that first wallet is now set as cashback wallet
    const firstWalletIsCashback = await generalSettings.verifyCashbackWalletIsSelected(testWallet1Mainnet.name);
    expect(firstWalletIsCashback, 'First wallet should be set as cashback wallet').to.be.true;

    await generalSettings.goToCashbackTab();
  });

  it('Check behaviour on Cashback page', async function () {
    const termsModal = new CashbackTermsModal(webdriver, logger);
    await termsModal.acceptDisclaimerAndProceed();

    const wrongWalletModal = new WrongWalletModal(webdriver, logger);
    const modalDisplayed = await wrongWalletModal.isDisplayed();
    expect(modalDisplayed, 'Wrong wallet modal should be displayed').to.be.true;

    // Set the current selected wallet as the cashback wallet
    await wrongWalletModal.clickSetThisWallet();

    // Verify modal is closed
    const modalIsClosed = await wrongWalletModal.modalIsClosed();
    expect(modalIsClosed, 'Modal should be closed after setting wallet').to.be.true;

    const cashbackPage = new CashbackPage(webdriver, logger);
    await cashbackPage.goToSettingsTab();
  });

  it('Check settings after applying new wallet', async function () {
    const generalSettings = new GeneralSubTab(webdriver, logger);
    const secondWalletIsCashback = await generalSettings.verifyCashbackWalletIsSelected(secondWalletName);
    expect(secondWalletIsCashback, 'Second wallet should now be set as cashback wallet').to.be.true;
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    const basePage = new BasePage(webdriver, logger);
    await basePage.closeBrowser();
  });
});
