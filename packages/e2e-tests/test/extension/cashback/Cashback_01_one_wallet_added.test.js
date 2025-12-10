import { expect } from 'chai';
import CashbackPage from '../../../pages/wallet/cashback/cashback.page.js';
import CashbackTermsModal from '../../../pages/wallet/cashback/modals/disclaimerModal.page.js';
import WalletTab from '../../../pages/wallet/walletTab/walletTab.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute, twoSeconds } from '../../../helpers/timeConstants.js';
import { pageTitle } from '../../../helpers/pageTitles.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Cashback One wallet added', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {WalletTab} */
  let walletTab = null;
  /** @type {CashbackTermsModal} */
  let termsModal = null;
  /** @type {CashbackPage} */
  let cashbackPage = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
    walletTab = new WalletTab(webdriver, logger);
    termsModal = new CashbackTermsModal(webdriver, logger);
    cashbackPage = new CashbackPage(webdriver, logger);
  });

  it('Navigates to Cashback page', async function () {
    await walletTab.goToCashbackTab();
    await walletTab.sleep(twoSeconds);

    // Verify we're on the cashback page
    const currentTitle = await walletTab.getPageTitle();
    expect(currentTitle).to.equal(pageTitle.cashback, `Expected to be on ${pageTitle.cashback} page`);
  });

  it('Check first-time popup is displayed', async function () {
    // Verify the disclaimer modal is displayed
    const modalDisplayed = await termsModal.isDisplayed();
    expect(modalDisplayed, 'Terms modal should be displayed').to.be.true;

    await termsModal.getDisclaimerTitleText();

    const modalIsClosed = await termsModal.closeCashbackTermsModal();
    expect(modalIsClosed, 'Terms modal should not be displayed').to.be.true;

    const currentTitle = await walletTab.getPageTitle();
    expect(currentTitle).to.equal(pageTitle.wallet, `Expected to be on ${pageTitle.wallet} page`);
  });

  it('Verify cannot continue without accepting terms on popup', async function () {
    await walletTab.goToCashbackTab();
    await walletTab.sleep(twoSeconds);

    // Check if proceed button is initially disabled
    const isInitiallyEnabled = await termsModal.isProceedButtonEnabled();
    expect(isInitiallyEnabled, 'Proceed button should be disabled initially').to.be.false;

    // Try to proceed without accepting terms
    await termsModal.proceedWithDisclaimer();
    // Verify the modal is still displayed
    const modalStillDisplayed = await termsModal.isDisplayed();
    expect(modalStillDisplayed, 'Terms modal should still be displayed').to.be.true;

    const modalIsClosed = await termsModal.acceptDisclaimerAndProceed();
    expect(modalIsClosed, 'Terms modal should not be displayed').to.be.true;
  });

  it('Check page has cashback cards', async function () {
    // Verify the claim button is visible
    const claimButtonVisible = await cashbackPage.isClaimCashbackButtonVisible();
    expect(claimButtonVisible).to.be.true;

    // Verify cashback cards are displayed
    const cardCount = await cashbackPage.getCashbackCardCount();
    expect(cardCount).to.be.greaterThan(0, 'Cashback cards should be displayed');
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await walletTab.closeBrowser();
  });
});
