import { customAfterEach } from '../../../utils/customHooks.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import SettingsTab from '../../../pages/wallet/settingsTab/settingsTab.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import GeneralSubTab from '../../../pages/wallet/settingsTab/generalSubTab.page.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Changing fiat currencies', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SettingsTab} */
  let settingsPage = null;
  /** @type {GeneralSubTab} */
  let generalSubTab = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await prepareWallet(webdriver, logger, 'testWallet1', this);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    generalSubTab = new GeneralSubTab(webdriver, logger);
  });

  const testData = ['BRL', 'ETH', 'BTC', 'KRW', 'CNY', 'EUR', 'JPY', 'USD'];

  for (const testDatum of testData) {
    describe(`Changing fiat currency to ${testDatum}`, function () {
      it('Open General settings', async function () {
        await transactionsPage.goToSettingsTab();
        await settingsPage.goToGeneralSubMenu();
      });

      it('Select currency', async function () {
        await generalSubTab.selectFiat(testDatum);
      });

      it(`Check the selected currency ${testDatum} is applied`, async function () {
        await generalSubTab.goToWalletTab();
        const walletInfo = await generalSubTab.getSelectedWalletInfo();
        if (testDatum === 'ADA') {
          expect(walletInfo.fiatBalance, 'Fiat balance is different').to.equal(0);
        } else {
          expect(walletInfo.fiatCurrency, 'Fiat currency is different').to.equal(testDatum);
          expect(walletInfo.balance, 'Fiat value is zero').to.not.equal(0);
        }
      });
    });
  }

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
