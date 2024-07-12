import { expect } from 'chai';
import BasePage from '../pages/basepage.js';
import driversPoolsManager from '../utils/driversPool.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';
import { preloadDBAndStorage, waitTxPage } from '../helpers/restoreWalletHelper.js';
import SendSubTab from '../pages/wallet/walletTab/sendSubTab.page.js';
import { getTestString } from '../helpers/constants.js';
import { RECEIVER_DOESNT_EXIST } from '../helpers/messages.js';

describe('Handle handles', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(async function () {
    webdriver = await driversPoolsManager.getDriverFromPool();
    logger = getTestLogger(this.test.parent.title);
    await preloadDBAndStorage(webdriver, logger, 'testWallet1');
    await waitTxPage(webdriver, logger);
  });

  const testDataPositive = [
    {
      userHandle: '$svinkopepo',
      provider: 'ADA Handle',
    },
    {
      userHandle: 'rahul.ada',
      provider: 'Cardano Name Service (CNS)',
    },
    {
      userHandle: 'stackchain.blockchain',
      provider: 'Unstoppable Domains',
    },
  ];

  const testDataNegative = [
    {
      userHandle: `${getTestString('$', 10, false)}`,
      provider: 'ADA Handle',
    },
    {
      userHandle: `${getTestString('', 7, false)}.ada`,
      provider: 'Cardano Name Service (CNS)',
    },
    {
      userHandle: `${getTestString('', 10, false)}.blockchain`,
      provider: 'Unstoppable Domains',
    },
  ];

  for (const testDatum of testDataPositive) {
    describe(`Positive case, ${testDatum.provider}`, function () {
      it(`${testDatum.provider}. Refresh page`, async function () {
        const transactionsPage = new TransactionsSubTab(webdriver, logger);
        await transactionsPage.refreshPage();
      });

      it(`${testDatum.provider}. Go to Send page`, async function () {
        const walletPage = new TransactionsSubTab(webdriver, logger);
        await walletPage.goToSendSubMenu();
        const sendPage = new SendSubTab(webdriver, logger);
        const stepOneDisplayed = await sendPage.stepOneIsDisplayed();
        expect(stepOneDisplayed, 'Step one is not displayed').to.be.true;
      });

      it(`${testDatum.provider}. Enter the value`, async function () {
        const sendStep1Page = new SendSubTab(webdriver, logger);
        await sendStep1Page.enterReceiver(testDatum.userHandle);
      });

      it(`${testDatum.provider}. Wait for domain resolver response`, async function () {
        const sendStep1Page = new SendSubTab(webdriver, logger);
        const greenMarkIsDisplayed = await sendStep1Page.receiverIsGood();
        expect(greenMarkIsDisplayed, 'Receiver is not checked').to.be.true;
      });

      it(`${testDatum.provider}. Check displayed info and continue`, async function () {
        const sendStep1Page = new SendSubTab(webdriver, logger);
        const helperText = await sendStep1Page.getReceiverHelperText();
        expect(helperText, 'A different provider is displayed').to.equal(testDatum.provider);
        const handlerAddress = await sendStep1Page.getReceiverHandlerAddress();
        expect(handlerAddress, 'Address is in a wrong format').to.match(
          /addr1[a-z0-9]{5}\.{3}[a-z0-9]{10}/
        );
        await sendStep1Page.clickNextToStep2();
      });

      it(`${testDatum.provider}. Enter amount and continue`, async function () {
        const sendStep2Page = new SendSubTab(webdriver, logger);
        await sendStep2Page.addAssets(1);
      });

      it(`${testDatum.provider}. Check info on confirmation page`, async function () {
        const sendStep3Page = new SendSubTab(webdriver, logger);
        const receiverHadlerInfo = await sendStep3Page.getHandlerInfoConfirmTxPage();
        const [provider, userHandleRaw] = receiverHadlerInfo.split(':');
        const userHandle = userHandleRaw.trim();
        expect(provider, 'Handler provider is different').to.equal(testDatum.provider);
        expect(userHandle, 'User handler is different').to.equal(testDatum.userHandle);
      });
    });
  }

  for (const testNegativeDatum of testDataNegative) {
    describe(`Negative case, ${testNegativeDatum.provider}`, function () {
      it(`${testNegativeDatum.provider}. Refresh page`, async function () {
        const transactionsPage = new TransactionsSubTab(webdriver, logger);
        await transactionsPage.refreshPage();
      });

      it(`${testNegativeDatum.provider}. Go to Send page`, async function () {
        const walletPage = new TransactionsSubTab(webdriver, logger);
        await walletPage.goToSendSubMenu();
        const sendPage = new SendSubTab(webdriver, logger);
        const stepOneDisplayed = await sendPage.stepOneIsDisplayed();
        expect(stepOneDisplayed, 'Step one is not displayed').to.be.true;
      });

      it(`${testNegativeDatum.provider}. Enter the value`, async function () {
        const sendStep1Page = new SendSubTab(webdriver, logger);
        await sendStep1Page.enterReceiver(testNegativeDatum.userHandle);
      });

      it(`${testNegativeDatum.provider}. Wait for domain resolver response`, async function () {
        const sendStep1Page = new SendSubTab(webdriver, logger);
        const errorMarkIsDisplayed = await sendStep1Page.receiverIsIncorrect();
        expect(errorMarkIsDisplayed, 'There is no error for receiver').to.be.true;
      });

      it(`${testNegativeDatum.provider}. Check displayed info and continue`, async function () {
        const sendStep1Page = new SendSubTab(webdriver, logger);
        const helperText = await sendStep1Page.getReceiverHelperText();
        expect(helperText, 'A different error message is displayed').to.equal(RECEIVER_DOESNT_EXIST);
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
