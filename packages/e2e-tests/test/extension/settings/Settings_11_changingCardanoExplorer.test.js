import { customAfterEach } from '../../../utils/customHooks.js';
import TransactionsSubTab from '../../../pages/wallet/walletTab/walletTransactions.page.js';
import { expect } from 'chai';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import SettingsTab from '../../../pages/wallet/settingsTab/settingsTab.page.js';
import driversPoolsManager from '../../../utils/driversPool.js';
import BlockchainSubTab from '../../../pages/wallet/settingsTab/blockchainSubTab.page.js';
import { prepareWallet } from '../../../helpers/restoreWalletHelper.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe('Changing explorer', function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {TransactionsSubTab} */
  let transactionsPage = null;
  /** @type {SettingsTab} */
  let settingsPage = null;
  /** @type {BlockchainSubTab} */
  let blockchainSubTab = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await prepareWallet(webdriver, logger, 'testWallet1Mainnet', this, false);
    transactionsPage = new TransactionsSubTab(webdriver, logger);
    settingsPage = new SettingsTab(webdriver, logger);
    blockchainSubTab = new BlockchainSubTab(webdriver, logger);
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

  for (const testDatum of testData) {
    describe(`Changing Cardano explorer to ${testDatum.explorerName}`, function () {
      it('Open Blockchain settings', async function () {
        await transactionsPage.goToSettingsTab();
        await settingsPage.goToBlockchainSubMenu();
      });

      it('Select explorer', async function () {
        await blockchainSubTab.selectExplorer(testDatum.explorerName);
      });

      it('Check the selected explorer is applied', async function () {
        await blockchainSubTab.goToWalletTab();
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

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await transactionsPage.closeBrowser();
  });
});
