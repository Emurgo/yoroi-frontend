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

describe('Cashback Two Wallets Added', function () {
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
  const secondWalletName = 'CashbackTestWallet';

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

  it('Check cashback wallet in settings is not set', async function () {
    await walletTabPage.goToSettingsTab();
    const selectedWallet = await generalSettings.getSelectedCashbackWallet();
    expect(selectedWallet, 'Some wallet is selected as cashback already').to.equal('');
  });

  it('Set first wallet as a cashback', async function () {
    // Set the first wallet as cashback wallet
    await generalSettings.selectCashbackWallet(testWallet1Mainnet.name);

    // Verify that first wallet is now set as cashback wallet
    const firstWalletIsCashback = await generalSettings.verifyCashbackWalletIsSelected(testWallet1Mainnet.name);
    expect(firstWalletIsCashback, 'First wallet should be set as cashback wallet').to.be.true;

    await generalSettings.goToCashbackTab();
  });

  it('Check behaviour on Cashback page', async function () {
    await termsModal.acceptDisclaimerAndProceed();

    const modalDisplayed = await wrongWalletModal.isDisplayed();
    expect(modalDisplayed, 'Wrong wallet modal should be displayed').to.be.true;

    // Set the current selected wallet as the cashback wallet
    await wrongWalletModal.clickSetThisWallet();

    // Verify modal is closed
    const modalIsClosed = await wrongWalletModal.modalIsClosed();
    expect(modalIsClosed, 'Modal should be closed after setting wallet').to.be.true;

    await cashbackPage.goToSettingsTab();
  });

  it('Check settings after applying new wallet', async function () {
    const secondWalletIsCashback = await generalSettings.verifyCashbackWalletIsSelected(secondWalletName);
    expect(secondWalletIsCashback, 'Second wallet should now be set as cashback wallet').to.be.true;
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletTabPage.closeBrowser();
  });
});
