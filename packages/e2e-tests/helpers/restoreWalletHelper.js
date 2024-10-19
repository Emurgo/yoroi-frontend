import AddNewWallet from '../pages/addNewWallet.page.js';
import BasePage from '../pages/basepage.js';
import RestoreWalletStepOne from '../pages/newWalletPages/restoreWalletSteps/restoreWalletStepOne.page.js';
import RestoreWalletStepTwo from '../pages/newWalletPages/restoreWalletSteps/restoreWalletStepTwo.page.js';
import WalletDetails from '../pages/newWalletPages/walletDetails.page.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import { getPassword } from '../helpers/constants.js';
import { expect } from 'chai';
import CreateWalletStepOne from '../pages/newWalletPages/createWalletSteps/createWalletStepOne.page.js';
import CreateWalletStepTwo from '../pages/newWalletPages/createWalletSteps/createWalletStepTwo.page.js';
import CreateWalletStepThree from '../pages/newWalletPages/createWalletSteps/createWalletStepThree.page.js';
import { walletNameShortener } from '../utils/utils.js';
import { extensionTabName, serviceWorkersTabName, WindowManager } from './windowManager.js';

export const restoreWallet = async (webdriver, logger, testWallet, shouldBeModalWindow = true) => {
  const addNewWalletPage = new AddNewWallet(webdriver, logger);
  await addNewWalletPage.selectRestoreWallet();
  const restoreWalletStepOnePage = new RestoreWalletStepOne(webdriver, logger);
  await restoreWalletStepOnePage.selectFifteenWordWallet();
  const restoreWalletStepTwoPage = new RestoreWalletStepTwo(webdriver, logger);
  await restoreWalletStepTwoPage.enterRecoveryPhrase15Words(testWallet.mnemonic);
  await restoreWalletStepTwoPage.sleep(100);
  await restoreWalletStepTwoPage.continue();
  const walletDetailsPage = new WalletDetails(webdriver, logger);
  if (shouldBeModalWindow) {
    await walletDetailsPage.closeTipsModalWindow();
  }
  const walletPassword = getPassword();
  await walletDetailsPage.enterWalletName(testWallet.name);
  await walletDetailsPage.enterWalletPassword(walletPassword);
  await walletDetailsPage.repeatWalletPassword(walletPassword);
  const walletPlate = await walletDetailsPage.getWalletPlate();
  expect(walletPlate, 'Wallet plate is different from expected').to.equal(testWallet.plate);
  await walletDetailsPage.continue();
  await checkCorrectWalletIsDisplayed(webdriver, logger, testWallet, shouldBeModalWindow);
};

export const checkCorrectWalletIsDisplayed = async (
  webdriver,
  logger,
  testWallet,
  shouldBeModalWindow = true
) => {
  const transactionsPage = new TransactionsSubTab(webdriver, logger);
  await transactionsPage.waitPrepareWalletBannerIsClosed();
  if (shouldBeModalWindow) {
    await transactionsPage.closeUpdatesModalWindow();
  }
  const txPageIsDisplayed = await transactionsPage.isDisplayed();
  expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
  const walletInfo = await transactionsPage.getSelectedWalletInfo();
  const shortedWalletName = walletNameShortener(testWallet.name);
  expect(walletInfo.name, `The wallet name should be "${testWallet.name}"`).to.equal(
    shortedWalletName
  );
  expect(walletInfo.plate, `The wallet plate should be "${testWallet.plate}"`).to.equal(
    testWallet.plate
  );
};

export const createWallet = async (webdriver, logger, testWalletName) => {
  const addNewWalletPage = new AddNewWallet(webdriver, logger);
  await addNewWalletPage.selectCreateNewWallet();
  const createWalletStepOnePage = new CreateWalletStepOne(webdriver, logger);
  await createWalletStepOnePage.continue();
  const createWalletStepTwoPage = new CreateWalletStepTwo(webdriver, logger);
  await createWalletStepTwoPage.closeTipsModalWindow();
  await createWalletStepTwoPage.toggleVisibilityOfRecoveryPhrase();
  await createWalletStepTwoPage.saveRecoveryPhrase();
  await createWalletStepTwoPage.continue();
  const createWalletStepThreePage = new CreateWalletStepThree(webdriver, logger);
  const recoveryPhrase = await createWalletStepThreePage.getRecoveryPhraseFromStorage();
  await createWalletStepThreePage.enterRecoveryPhrase(recoveryPhrase);
  await createWalletStepThreePage.continue();
  const walletDetailsPage = new WalletDetails(webdriver, logger);
  await walletDetailsPage.closeTipsModalWindow();
  const walletPassword = getPassword();
  await walletDetailsPage.enterWalletName(testWalletName);
  await walletDetailsPage.enterWalletPassword(walletPassword);
  await walletDetailsPage.repeatWalletPassword(walletPassword);
  const walletPlate = await walletDetailsPage.getWalletPlate();
  await walletDetailsPage.saveToLocalStorage('walletPlate', walletPlate);
  await walletDetailsPage.continue();
  const transactionsPage = new TransactionsSubTab(webdriver, logger);
  await transactionsPage.closeUpdatesModalWindow();
  await transactionsPage.waitPrepareWalletBannerIsClosed();
  const txPageIsDisplayed = await transactionsPage.isDisplayed();
  expect(txPageIsDisplayed).to.be.true;
  const walletInfo = await transactionsPage.getSelectedWalletInfo();
  expect(walletInfo.balance, 'The wallet balance should be 0 (zero)').to.equal(0);
  const expWalletPlate = await transactionsPage.getFromLocalStorage('walletPlate');
  const shortedWalletName = walletNameShortener(testWalletName);
  expect(walletInfo.name, `The wallet name should be "${testWalletName}"`).to.equal(
    shortedWalletName
  );
  expect(walletInfo.plate, `The wallet plate should be "${expWalletPlate}"`).to.equal(
    expWalletPlate
  );
  return walletInfo;
};

export const preloadDBAndStorage = async (webdriver, logger, templateName) => {
  logger.info(`--------------------- preloadDBAndStorage START ---------------------`);
  const addWalletPage = new AddNewWallet(webdriver, logger);
  const state = await addWalletPage.isDisplayed();
  expect(state).to.be.true;
  await addWalletPage.prepareDBAndStorage(templateName);
  // It is necessary to re-run the service worker after loading info into the indexedDB
  await restartServiceWorker(webdriver, logger);
  logger.info(`--------------------- preloadDBAndStorage END ---------------------`);
};

export const waitTxPage = async (webdriver, logger) => {
  const transactionsPage = new TransactionsSubTab(webdriver, logger);
  await transactionsPage.waitPrepareWalletBannerIsClosed();
  const txPageIsDisplayed = await transactionsPage.isDisplayed();
  expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
};

export const restartServiceWorker = async (webdriver, logger) => {
  logger.info(`--------------------- restartServiceWorker START ---------------------`);
  const windowManager = new WindowManager(webdriver, logger);
  windowManager.init();
  await windowManager.openNewTab(serviceWorkersTabName, serviceWorkersTabName);

  const basepage = new BasePage(webdriver, logger);

  const stopBtnLocator = {
    locator: '//button[text()="Stop"]',
    method: 'xpath',
  };
  const btnLocator = {
    locator: '//button',
    method: 'xpath',
  };

  const stopBtnElems = await basepage.findElements(stopBtnLocator);
  const stopBtnElem = stopBtnElems[1];
  await stopBtnElem.click();

  await basepage.sleep(500);

  const allBtns = await basepage.findElements(btnLocator);
  const startBtn = allBtns[7];
  await startBtn.click();

  await basepage.sleep(500);

  await windowManager.closeTabWindow(serviceWorkersTabName, extensionTabName);
  await basepage.refreshPage();
  logger.info(`--------------------- restartServiceWorker END ---------------------`);
};

export const collectInfo = async (mochaContext, webdriver, logger) => {
  logger.info(`--------------------- collectInfo START ---------------------`);
  const basepage = new BasePage(webdriver, logger);
  basepage.takeScreenshot(mochaContext.test.parent.title, 'preparationSteps');
  basepage.takeSnapshot(mochaContext.test.parent.title, 'preparationSteps');
  basepage.getBrowserLogs(mochaContext.test.parent.title, 'preparationSteps');
  basepage.getDriverLogs(mochaContext.test.parent.title, 'preparationSteps');
  logger.info(`--------------------- collectInfo END ---------------------`);
}
