import BasePage from '../pages/basepage.js';
import { customAfterEach } from '../utils/customHooks.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { testWallet1 } from '../utils/testWallets.js';
import { expect } from 'chai';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { restoreWallet } from '../helpers/restoreWalletHelper.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import driversPoolsManager from '../utils/driversPool.js';
import BlockchainSubTab from '../pages/wallet/settingsTab/blockchainSubTab.page.js';

describe('Changing explorer', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(function (done) {
    webdriver = driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    done();
  });

  const testData = [
    {
      explorerName: 'CardanoScan',
      reExplorerURL: /^https:\/\/cardanoscan\.io/,
    },
    {
      explorerName: 'AdaStat',
      reExplorerURL: /^https:\/\/adastat\.net/,
    },
    {
      explorerName: 'CardanoExplorer',
      reExplorerURL: /^https:\/\/explorer\.cardano\.org/,
    },
    {
      explorerName: 'Cexplorer',
      reExplorerURL: /^https:\/\/cexplorer\.io/,
    },
    {
      explorerName: 'Blockchair',
      reExplorerURL: /^https:\/\/blockchair\.com/,
    },
  ];

  it('Restore a 15-word wallet', async function () {
    await restoreWallet(webdriver, logger, testWallet1);
    const transactionsPage = new TransactionsSubTab(webdriver, logger);
    const txPageIsDisplayed = await transactionsPage.isDisplayed();
    expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
  });

  for (const testDatum of testData) {
    describe(`Changing Cardano explorer to ${testDatum.explorerName}`, function () {
      it('Open Blockchain settings', async function () {
        const transactionsPage = new TransactionsSubTab(webdriver, logger);
        await transactionsPage.goToSettingsTab();
        const settingsPage = new SettingsTab(webdriver, logger);
        await settingsPage.goToBlockchainSubMenu();
      });

      it('Select explorer', async function () {
        const blockchainSubTab = new BlockchainSubTab(webdriver, logger);
        await blockchainSubTab.selectExplorer(testDatum.explorerName);
      });

      it('Check the selected explorer is applied', async function () {
        const blockchainSubTab = new BlockchainSubTab(webdriver, logger);
        await blockchainSubTab.goToWalletTab();
        const transactionsPage = new TransactionsSubTab(webdriver, logger);
        const allTxLinks = await transactionsPage.getTxURLs(0, 0);
        for (const key in allTxLinks) {
          const links = allTxLinks[key];
          for (const link of links) {
            expect(link, 'Wrong link').to.match(testDatum.reExplorerURL);
          }
        }
      });
    });
  }

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
