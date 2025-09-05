import { expect } from 'chai';
import driversPoolsManager from '../utils/driversPool.js';
import { getTestLogger } from '../utils/utils.js';
import { customAfterEach } from '../utils/customHooks.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { prepareWallet } from '../helpers/restoreWalletHelper.js';
import WalletTab from '../pages/wallet/walletTab/walletTab.page.js';
import PortfolioMainPage from '../pages/wallet/portfolio/portfolioMain.page.js';
import BasePage from '../pages/basepage.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';

describe('Portfolio Balance and Fiat', function () {
  this.timeout(2 * oneMinute);

  let webdriver = null;
  let logger = null;

  before(async function () {
    logger = getTestLogger(this.test.parent.title);
    webdriver = await driversPoolsManager.getDriverFromPool();
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
  });

  it('Verify portfolio balance and fiat currency display', async function () {
    const walletTab = new WalletTab(webdriver, logger);
    await walletTab.goToPortfolioTab();

    const portfolioPage = new PortfolioMainPage(webdriver, logger);

    await portfolioPage.waitForBalanceToLoad();

    const portfolioBalance = await portfolioPage.getPortfolioBalance();
    expect(portfolioBalance, 'Portfolio balance should be displayed').to.not.be.empty;

    const topBarBalance = (await walletTab.getSelectedWalletInfo()).balance.toString();
    expect(portfolioBalance.replace(/\s/g, ''), 'Portfolio balance should match top bar balance').to.equal(
      topBarBalance.replace(/\s/g, '')
    );
  });

  it('Switch fiat currency to EUR in Settings', async function () {
    const walletTab = new WalletTab(webdriver, logger);
    const settingsTab = new SettingsTab(webdriver, logger);
    const generalSubTab = new GeneralSubTab(webdriver, logger);

    await walletTab.goToSettingsTab();
    await settingsTab.goToGeneralSubMenu();
    await generalSubTab.selectFiat('EUR');
  });

  it('Verify Portfolio reflects EUR fiat selection', async function () {
    const walletTab = new WalletTab(webdriver, logger);
    await walletTab.goToPortfolioTab();

    const portfolioPage = new PortfolioMainPage(webdriver, logger);
    await portfolioPage.waitForBalanceToUpdate();

    // Verify both portfolio header and top-right wallet info show EUR
    const headerFiatText = await portfolioPage.getPortfolioBalance();
    const headerFiatNumber = Number((headerFiatText || '').replace(/[^0-9.]/g, ''));

    const { fiatBalance, fiatCurrency } = await walletTab.getSelectedWalletInfo();

    expect(fiatCurrency, 'Top-right fiat currency should be EUR').to.equal('EUR');
    expect(Number.isFinite(headerFiatNumber), `Header fiat should be numeric, got: ${headerFiatText}`).to.be.true;
    expect(Number.isFinite(fiatBalance), `Top-right fiat should be numeric, got: ${fiatBalance}`).to.be.true;
    expect(headerFiatNumber, 'Portfolio header should show EUR value').to.be.greaterThan(0);
    expect(fiatBalance, 'Top-right fiat should show EUR value').to.be.greaterThan(0);

    // Verify that the portfolio page is still functional after currency change
    const assetCount = await portfolioPage.countAssets();
    expect(assetCount, 'Portfolio should still show assets after currency change').to.equal(3);
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
