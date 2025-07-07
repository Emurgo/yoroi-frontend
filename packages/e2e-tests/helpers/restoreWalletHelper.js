import AddNewWallet from '../pages/addNewWallet.page.js';
import BasePage from '../pages/basepage.js';
import RestoreWalletStepOne from '../pages/newWalletPages/restoreWalletSteps/restoreWalletStepOne.page.js';
import RestoreWalletStepTwo from '../pages/newWalletPages/restoreWalletSteps/restoreWalletStepTwo.page.js';
import WalletDetails from '../pages/newWalletPages/walletDetails.page.js';
import TransactionsSubTab from '../pages/wallet/walletTab/walletTransactions.page.js';
import SettingsTab from '../pages/wallet/settingsTab/settingsTab.page.js';
import GeneralSubTab from '../pages/wallet/settingsTab/generalSubTab.page.js';
import SwitchNetworkModal from '../pages/wallet/settingsTab/modals/switchNetworkModal.page.js';
import { CardanoNetworks, getPassword } from '../helpers/constants.js';
import { expect } from 'chai';
import CreateWalletStepOne from '../pages/newWalletPages/createWalletSteps/createWalletStepOne.page.js';
import CreateWalletStepTwo from '../pages/newWalletPages/createWalletSteps/createWalletStepTwo.page.js';
import CreateWalletStepThree from '../pages/newWalletPages/createWalletSteps/createWalletStepThree.page.js';
import { isChrome, walletNameShortener } from '../utils/utils.js';
import {
  extensionTabName,
  serviceWorkersLink,
  serviceWorkersTabName,
  WindowManager,
} from './windowManager.js';
import { quarterSecond } from './timeConstants.js';
import NetworksInfoModal from '../pages/wallet/settingsTab/modals/networksInfoModal.page.js';

export const restoreWallet = async (
  webdriver,
  logger,
  testWallet,
  shouldBeModalWindow = true,
  preloadBrowserLocalStorage = true
) => {
  if (preloadBrowserLocalStorage) {
    await preloadBrowserStorage(webdriver, logger);
    await restartServiceWorker(webdriver, logger);
  }
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
  await checkCorrectWalletIsDisplayed(webdriver, logger, testWallet);
};

export const checkCorrectWalletIsDisplayed = async (webdriver, logger, testWallet) => {
  const transactionsPage = new TransactionsSubTab(webdriver, logger);
  await transactionsPage.waitPrepareWalletBannerIsClosed();
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

export const switchToPreprod = async (webdriver, logger, shouldBeModalWindow) => {
  const transactionsPage = new TransactionsSubTab(webdriver, logger);
  await transactionsPage.goToSettingsTab();
  if (shouldBeModalWindow) {
    const networkInfoModal = new NetworksInfoModal(webdriver, logger);
    const infoModalIsDisplayed = await networkInfoModal.isDisplayed();
    expect(infoModalIsDisplayed, 'The networks info modal is not displayed').to.be.true;
    await networkInfoModal.understand();
  }
  const settingsPage = new SettingsTab(webdriver, logger);
  await settingsPage.goToGeneralSubMenu();
  const generalSettingsPage = new GeneralSubTab(webdriver, logger);
  await generalSettingsPage.openSwitchNetworkModal();
  const networkSwitchModal = new SwitchNetworkModal(webdriver, logger);
  const networkSwitchModalIsDisplayed = await networkSwitchModal.isDisplayed();
  expect(networkSwitchModalIsDisplayed, 'The network switch modal is not displayed').to.be.true;
  await networkSwitchModal.selectNetwork(CardanoNetworks.PP);
  await generalSettingsPage.waitPrepareWalletBannerIsClosed();
  await generalSettingsPage.goToWalletTab();
};

export const preloadDBAndStorage = async (
  webdriver,
  logger,
  templateName,
  useGeneralStorageInfo = true
) => {
  logger.info(`--------------------- preloadDBAndStorage START ---------------------`);
  const addWalletPage = new AddNewWallet(webdriver, logger);
  const state = await addWalletPage.isDisplayed();
  expect(state, 'The Add new wallet page is not displayed').to.be.true;
  await addWalletPage.prepareDBAndStorage(templateName, useGeneralStorageInfo);
  // It is necessary to re-run the service worker after loading info into the indexedDB
  if (isChrome()) {
    await restartServiceWorker(webdriver, logger);
  } else {
    await addWalletPage.refreshPage();
  }
  logger.info(`--------------------- preloadDBAndStorage END ---------------------`);
};

export const preloadBrowserStorage = async (
  webdriver,
  logger,
  templateName = 'general',
  useGeneralStorageInfo = true,
  opts = {}
) => {
  logger.info(`--------------------- preloadBrowserStorage START ---------------------`);
  const addWalletPage = new AddNewWallet(webdriver, logger);
  const state = await addWalletPage.isDisplayed();
  expect(state, 'The Add new wallet page is not displayed').to.be.true;
  await addWalletPage.prepareBrowserLocalStorage(templateName, useGeneralStorageInfo, opts);
  logger.info(`--------------------- preloadBrowserStorage END ---------------------`);
};

export const waitTxPage = async (webdriver, logger) => {
  const transactionsPage = new TransactionsSubTab(webdriver, logger);
  await transactionsPage.waitInitialWalletLoaderIsClosed();
  await transactionsPage.waitPrepareWalletBannerIsClosed();
  const txPageIsDisplayed = await transactionsPage.isDisplayed();
  expect(txPageIsDisplayed, 'The transactions page is not displayed').to.be.true;
};

export const restartServiceWorker = async (webdriver, logger) => {
  logger.info(`--------------------- restartServiceWorker START ---------------------`);
  const windowManager = new WindowManager(webdriver, logger);
  windowManager.init();
  await windowManager.openNewTab(serviceWorkersTabName, serviceWorkersLink);

  const basepage = new BasePage(webdriver, logger);
  await basepage.sleep(quarterSecond);

  const stopBtnLocator = {
    locator: 'div.worker-controls > button:nth-child(1)',
    method: 'css',
  };
  const startBtnLocator = {
    locator: 'div.registration-controls > button:nth-child(2)',
    method: 'css',
  };

  await basepage.click(stopBtnLocator);
  await basepage.sleep(500);
  await basepage.click(startBtnLocator);
  await basepage.sleep(500);

  await windowManager.closeTabWindow(serviceWorkersTabName, extensionTabName);
  await basepage.refreshPage();
  await basepage.goToExtensionTransactions();
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
};

export const prepareWallet = async (
  webdriver,
  logger,
  testWalletName,
  mochaContext,
  useGeneralStorageInfo = true
) => {
  try {
    await preloadDBAndStorage(webdriver, logger, testWalletName, useGeneralStorageInfo);
    await waitTxPage(webdriver, logger);
  } catch (error) {
    await collectInfo(mochaContext, webdriver, logger);
    throw new Error(error);
  }
};
