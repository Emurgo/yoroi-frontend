// @flow

import {
  Before,
  BeforeAll,
  Given,
  Then,
  After,
  AfterAll,
  setDefinitionFunctionWrapper,
  setDefaultTimeout,
  When,
} from 'cucumber';
import * as CardanoServer from '../mock-chain/mockCardanoServer';
import { logging } from 'selenium-webdriver';
import { getLogDate } from '../support/helpers/helpers';
import { testWallets } from '../mock-chain/TestWallets';
import * as CardanoImporter from '../mock-chain/mockCardanoImporter';
import {
  testRunsDataDir,
  snapshotsDir,
  commonWalletPassword,
  fiveMinute,
  oneSecond,
  halfSecond,
  quarterMinute,
  halfMinute,
} from '../support/helpers/common-constants';
import { expect } from 'chai';
import { satisfies } from 'semver';
// eslint-disable-next-line import/named
import stableStringify from 'json-stable-stringify';
import type { WalletNames } from '../mock-chain/TestWallets';
import { waitUntilUrlEquals, navigateTo } from '../support/helpers/route-helpers';
import { promises as fsAsync } from 'fs';
import type { LocatorObject } from '../support/webdriver';
import { walletButton } from '../pages/sidebarPage';
import { getWalletButtonByPlate } from '../pages/walletsListPage';
import {
  connectHwButton,
  getCurrencyButton,
  pickUpCurrencyDialog,
  hwOptionsDialog,
  trezorWalletButton,
  eraOptionsDialog,
  shelleyEraButton,
  trezorConnectDialog,
  trezorConfirmButton,
  walletNameInput,
  saveDialog,
  selectWalletTypeStepBox,
  restoreNormalWallet,
  restoreWalletButton,
  saveButton,
  createWalletButton,
  infoDialog,
} from '../pages/newWalletPages';
import { allowPubKeysAndSwitchToYoroi, switchToTrezorAndAllow } from './trezor-steps';
import {
  restoreWalletInputPhraseDialog,
  inputMnemonicForWallet,
  validPhraseText,
  nextButton,
  inputWalletInfo,
} from '../pages/restoreWalletPage';
import {
  backupPrivacyWarningDialog,
  checkRecoveryPhrase2Checkboxes,
  creationConfirmButton,
  creationWarningContinueButton,
  iWrittenDownButton,
  mnemonicPhraseText,
  nobodyLooksCheckbox,
  recoveryPhraseEntryDialog,
  recoveryPhraseEntryDialogConfirmButton,
  repeatRecoveryPhrase,
  walletInfoDialog,
  walletRecoveryPhraseDisplayDialog,
} from '../pages/createWalletPage';
import * as helpers from '../support/helpers/helpers';
import { walletSummaryBox } from '../pages/walletTransactionsHistoryPage';
import { walletSyncingOverlayComponent } from '../pages/walletPage';
import {
  continueButton,
  getTosCheckbox,
  languageSelectionForm,
  loadingSpinnerComponent,
  termsOfUseComponent,
  walletAddComponent,
} from '../pages/basicSetupPage';
import {
  getComplexityLevelButton,
  goToSettings,
  revampThemeRadiobutton,
  selectSubmenuSettings,
  settingsLayoutComponent,
} from '../pages/settingsPage';
import {
  allowButton,
  finishButton,
  uriAcceptComponent,
  uriPromptForm,
} from '../pages/uriPromptPage';
import { root } from '../pages/mainWindowPage';
import { backgroungTabName, extensionTabName, WindowManager } from '../support/windowManager';
import { MockDAppWebpage } from '../mock-dApp-webpage';
import { infoDialogContinueButton } from '../pages/commonDialogPage';
import {
  newWalletDialogPlate,
  repeatPasswordInput,
  walletPasswordInput,
} from '../pages/walletDetailsPage';

const simpleNodeLogger = require('simple-node-logger');

const { promisify } = require('util');
const fs = require('fs');
const rimraf = require('rimraf');

/** We need to keep track of our progress in testing to give unique names to screenshots */
const testProgress = {
  scenarioName: '',
  lineNum: 0, // we need this to differentiate scenarios with multiple "examples"
  step: 0,
};

BeforeAll(() => {
  setDefaultTimeout(halfMinute);
  const chromeDataDir = `${testRunsDataDir}_chrome`;
  const firefoxDataDir = `${testRunsDataDir}_chrome`;
  const chromeMockServerDataDir = `${testRunsDataDir}_cardanoMockServerLogs`;
  rimraf.sync(chromeDataDir);
  rimraf.sync(firefoxDataDir);
  rimraf.sync(chromeMockServerDataDir);

  CardanoServer.getMockServer({});
});

AfterAll(() => {
  CardanoServer.closeMockServer();
});

// eslint-disable-next-line prefer-arrow-callback
Before(function (scenario) {
  const pathItems = scenario.sourceLocation.uri.split('/');
  // eslint-disable-next-line no-console
  console.log(
    `\n### ${pathItems[pathItems.length - 2]}. The scenario "${scenario.pickle.name}" has started`
  );
  CardanoServer.setExpectedTx(undefined);
  // cleanup scenario name so it is folder-name friendly
  testProgress.scenarioName = scenario.pickle.name.replace(/[^0-9a-z_ ]/gi, '');
  testProgress.lineNum = scenario.sourceLocation.line;
  testProgress.step = 0;

  const logsDir = `${testRunsDataDir}_${this.getBrowser()}/${testProgress.scenarioName}/`;

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const mockAndWMLogPath = `${logsDir}mockAndWM.log`;
  const mockAndWMLogger = simpleNodeLogger.createSimpleFileLogger(mockAndWMLogPath);
  this.windowManager = new WindowManager(this.driver, mockAndWMLogger);
  this.windowManager.init().then().catch();
  this.addToLoggers(mockAndWMLogger);
  this.mockDAppPage = new MockDAppWebpage(this.driver, mockAndWMLogger);

  const webDriverLogPath = `${logsDir}webDriver.log`;
  this.webDriverLogger = simpleNodeLogger.createSimpleFileLogger(webDriverLogPath);
  this.addToLoggers(this.webDriverLogger);

  const trezorEmuLogPath = `${logsDir}trezorEmulatorController.log`;
  this.trezorEmuLogger = simpleNodeLogger.createSimpleFileLogger(trezorEmuLogPath);
  this.addToLoggers(this.trezorEmuLogger);

  this.sendToAllLoggers(`#### The scenario "${scenario.pickle.name}" has started ####`);
});

Before({ tags: 'not @TestAssuranceChain' }, () => {
  CardanoImporter.resetChain(CardanoImporter.MockChain.Standard);
});
Before({ tags: '@TestAssuranceChain' }, () => {
  CardanoImporter.resetChain(CardanoImporter.MockChain.TestAssurance);
});

Before({ tags: '@serverDown' }, () => {
  CardanoServer.closeMockServer();
});
After({ tags: '@serverDown' }, () => {
  CardanoServer.getMockServer({});
});

Before({ tags: '@serverMaintenance' }, () => {
  CardanoImporter.serverIssue();
});
After({ tags: '@serverMaintenance' }, () => {
  CardanoImporter.serverFixed();
});

Before({ tags: '@appMaintenance' }, () => {
  CardanoImporter.appMaintenance();
});
After({ tags: '@appMaintenance' }, () => {
  CardanoImporter.appMaintenanceFinish();
});

Before({ tags: '@invalidWitnessTest' }, () => {
  CardanoServer.closeMockServer();
  CardanoServer.getMockServer({
    signedTransaction: (req, res) => {
      res.status(400).jsonp({
        message: 'Invalid witness',
      });
    },
  });
});

After({ tags: '@invalidWitnessTest' }, () => {
  CardanoServer.closeMockServer();
  CardanoServer.getMockServer({});
});

After({ tags: '@trezorEmulatorTest' }, async function () {
  await this.trezorController.bridgeStop();
  await this.trezorController.emulatorStop();
  this.trezorController.closeWsConnection();
});

Before({ tags: '@smoke' }, () => {
  setDefaultTimeout(fiveMinute);
});

After(async function (scenario) {
  this.sendToAllLoggers(`#### The scenario "${scenario.pickle.name}" has done ####`);
  if (scenario.result.status === 'failed') {
    await takeScreenshot(this.driver, 'failedStep');
    await takePageSnapshot(this.driver, 'failedStep');
    if (this.getBrowser() !== 'firefox') {
      await getLogs(this.driver, 'failedStep', logging.Type.BROWSER);
      await getLogs(this.driver, 'failedStep', logging.Type.DRIVER);
      // getting logs from background
      await this.windowManager.openNewTab(backgroungTabName, this.getBackgroundUrl());
      await this.windowManager.switchTo(backgroungTabName);
      await getLogs(this.driver, 'background', logging.Type.BROWSER);
      await this.windowManager.switchTo(extensionTabName);
    }
  }
  await this.windowManager.switchTo(extensionTabName);
  await getIndexedDBTablesInfo(this, 'second_test_done');
  await this.driver.quit();
  await helpers.sleep(halfSecond);
});

export async function getIndexedDBTablesInfo(customWorld: any, postfix: string = '') {
  const dir = await createDirInTestRunsData(customWorld.driver, 'IndexedDBTables');
  const tables = [
    'UtxoAtSafePointTable',
    'UtxoDiffToBestBlock',
    'UtxoTransactionInput',
    'UtxoTransactionOutput',
  ];

  for (const table of tables) {
    const filePath = `${dir}/${table}_${postfix}.json`;
    const dbResponse = await customWorld.getInfoFromIndexedDB(table);
    await writeFile(filePath, JSON.stringify(dbResponse));
  }
}

const writeFile = promisify(fs.writeFile);

// Steps that contain these patterns will trigger screenshots:
const SCREENSHOT_STEP_PATTERNS = ['I should see', 'I see', 'I click', 'by clicking', 'I enter'];

const takeScreenShotsAndLogs = async (customWebDriver, featureName, patterns) => {
  if (patterns.some(pat => featureName.includes(pat))) {
    await takeScreenshot(customWebDriver.driver, featureName);
    await takePageSnapshot(customWebDriver.driver, featureName);

    const browserName = await customWebDriver.getBrowser();
    if (browserName !== 'firefox') {
      await getLogs(customWebDriver.driver, featureName, logging.Type.BROWSER);
      await getLogs(customWebDriver.driver, featureName, logging.Type.DRIVER);
    }
  }
};

/** Wrap every step to take screenshots for UI-based testing */
setDefinitionFunctionWrapper((fn, _, pattern) => {
  if (!pattern) {
    return fn;
  }
  return async function (...args) {
    // Regex patterns contain non-ascii characters.
    // We want to remove this to get a filename-friendly string
    const cleanString = pattern.toString().replace(/[^0-9a-z_ ]/gi, '');

    await takeScreenShotsAndLogs(this, cleanString + '_before', SCREENSHOT_STEP_PATTERNS);

    const ret = await fn.apply(this, args);

    await takeScreenShotsAndLogs(this, cleanString + '_executed', SCREENSHOT_STEP_PATTERNS);

    testProgress.step += 1;
    return ret;
  };
});

async function createDirInTestRunsData(driver, subdirectoryName) {
  const cap = await driver.getCapabilities();
  const browserName = cap.getBrowserName();

  const dir = `${testRunsDataDir}_${browserName}/${testProgress.scenarioName}/${subdirectoryName}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

async function takeScreenshot(driver, name) {
  // path logic
  const dir = await createDirInTestRunsData(driver, 'screenshots');
  const path = `${dir}/${testProgress.step}_${testProgress.lineNum}-${name}.png`;

  const screenshot = await driver.takeScreenshot();
  await writeFile(path, screenshot, 'base64');
}

async function takePageSnapshot(driver, name) {
  const dir = await createDirInTestRunsData(driver, 'pagesSnapshots');
  const htmlLogPath = `${dir}/${testProgress.step}_${testProgress.lineNum}-${name}-dom.html`;
  const html = await driver.executeScript('return document.body.innerHTML;');
  await fsAsync.writeFile(htmlLogPath, html);
}

/**
 * Creates a new log file when a new test starts.
 *
 * @param driver The driver.
 * @param name The name of the test.
 * @param loggingType The logging type required. Select logging.Type.DRIVER or logging.Type.BROWSER.
 */
async function getLogs(driver, name, loggingType) {
  let log = '';
  if (loggingType === logging.Type.DRIVER) {
    log = 'driver';
  } else if (loggingType === logging.Type.BROWSER) {
    log = 'console';
  }

  const dir = await createDirInTestRunsData(driver, `${log}Logs`);
  const consoleLogPath = `${dir}/${testProgress.step}_${testProgress.lineNum}-${name}-${log}-log.json`;
  const logEntries = await driver.manage().logs().get(loggingType, logging.Level.ALL);
  const jsonLogs = logEntries.map(l => l.toJSON());
  await fsAsync.writeFile(consoleLogPath, JSON.stringify(jsonLogs));
}

async function restoreWallet(
  customWorld: any,
  walletEra: string,
  walletName: WalletNames
): Promise<void> {
  customWorld.webDriverLogger.info(`Step:restoreWallet: Restoring the wallet "${walletName}"`);
  const restoreInfo = testWallets[walletName];
  expect(restoreInfo).to.not.equal(undefined);

  await customWorld.click(restoreWalletButton);
  customWorld.webDriverLogger.info(`Step:restoreWallet: Clicked restoreWalletButton`);
  await customWorld.waitForElement(selectWalletTypeStepBox);

  await customWorld.click(restoreNormalWallet);
  customWorld.webDriverLogger.info(`Step:restoreWallet: Selected 15-word wallet`);
  // input recovery phrase dialog
  await customWorld.waitForElement(restoreWalletInputPhraseDialog);
  customWorld.webDriverLogger.info(`Step:restoreWallet: Wallet recovery phrase step is displayed`);
  await inputMnemonicForWallet(customWorld, restoreInfo);
  customWorld.webDriverLogger.info(`Step:restoreWallet: Mnemonic phrase is entered`);
  await customWorld.waitForElement(validPhraseText);
  await customWorld.click(nextButton);
  // info panel
  if (await customWorld.checkIfExists(infoDialog)) {
    await customWorld.waitForElement(infoDialog);
    customWorld.webDriverLogger.info(`Step:restoreWallet: Info panel is displayed`);
    await customWorld.click(infoDialogContinueButton);
    customWorld.webDriverLogger.info(`Step:restoreWallet: Info panel is closed`);
  }
  // wallet info dialog
  await inputWalletInfo(customWorld, restoreInfo);
  customWorld.webDriverLogger.info(`Step:restoreWallet: Wallet info is entered`);
  await checkWalletPlate(customWorld, restoreInfo.plate);
  customWorld.webDriverLogger.info(`Step:restoreWallet: Wallet plate is checked`);
  await customWorld.click(nextButton);
  customWorld.webDriverLogger.info(`Step:restoreWallet: Wallet is fully synchronized`);
}

export async function checkWalletPlate(
  customWorld: any,
  expectedWalletPlate: string
): Promise<void> {
  const plateElement = await customWorld.findElement(newWalletDialogPlate);
  const plateText = await plateElement.getText();
  expect(plateText).to.be.equal(expectedWalletPlate);
}

export async function checkErrorByTranslationId(
  client: Object,
  errorSelector: LocatorObject,
  errorObject: Object
) {
  await client.waitUntilText(errorSelector, await client.intl(errorObject.message), quarterMinute);
}

Then(/^I pause the test to debug$/, async function () {
  this.webDriverLogger.info(`Step: I pause the test to debug`);
  await this.waitForElement({ locator: '.element_that_does_not_exist', method: 'css' });
});

Given(/^There is a Shelley wallet stored named ([^"]*)$/, async function (walletName: WalletNames) {
  this.webDriverLogger.info(`Step: There is a Shelley wallet stored named ${walletName}`);
  const browserName = await this.getBrowser();
  if (walletName === 'Second-Smoke-Test-Wallet' && browserName === 'firefox') {
    await restoreWallet(this, 'shelley', 'Second-Smoke-Test-Wallet-FF');
  } else {
    await restoreWallet(this, 'shelley', walletName);
  }
});

Given(/^There is a Byron wallet stored named ([^"]*)$/, async function (walletName: WalletNames) {
  this.webDriverLogger.info(`Step: There is a Byron wallet stored named ${walletName}`);
  await restoreWallet(this, 'byron', walletName);
});

Given(/^I create a new Shelley wallet with the name ([^"]*)$/, async function (walletName) {
  await this.click(createWalletButton);

  await this.waitForElement(pickUpCurrencyDialog);
  await this.click(getCurrencyButton('cardano'));

  await this.waitForElement(walletInfoDialog);
  await this.input(walletNameInput, walletName);
  await this.input(walletPasswordInput, commonWalletPassword);
  await this.input(repeatPasswordInput, commonWalletPassword);
  await this.click(creationConfirmButton);

  await this.waitForElement(backupPrivacyWarningDialog);
  await this.click(nobodyLooksCheckbox);
  await this.waitEnable(creationWarningContinueButton);
  await this.click(creationWarningContinueButton);

  await this.waitForElement(walletRecoveryPhraseDisplayDialog);
  const rawMnemonicPhrase = (await this.getText(mnemonicPhraseText)).trim();
  await this.click(iWrittenDownButton);

  // enter recovery phrase
  await this.waitForElement(recoveryPhraseEntryDialog);
  await repeatRecoveryPhrase(this, rawMnemonicPhrase);
  await checkRecoveryPhrase2Checkboxes(this);
  await this.click(recoveryPhraseEntryDialogConfirmButton);
});

Given(/^I have completed the basic setup$/, async function () {
  this.webDriverLogger.info(`Step: I have completed the basic setup`);
  // language select page
  await this.waitForElement(languageSelectionForm);
  await this.click(continueButton);
  // ToS page
  await this.waitForElement(termsOfUseComponent);
  const checkbox = await getTosCheckbox(this);
  await checkbox.click();
  await this.click(continueButton);
  // uri prompt page
  await acceptUriPrompt(this);
  await this.waitForElement(walletAddComponent);
});

Given(/^I switched to the advanced level$/, async function () {
  this.webDriverLogger.info(`Step: I switched to the advanced level`);
  // Navigate to the general settings screen
  await navigateTo.call(this, '/settings');
  await navigateTo.call(this, '/settings/general');
  await waitUntilUrlEquals.call(this, '/settings/general');
  await this.waitForElement(settingsLayoutComponent);
  // Click on secondary menu "levelOfComplexity" item
  await selectSubmenuSettings(this, 'levelOfComplexity');
  // Select the most complex level
  const cardChoseButton = await getComplexityLevelButton(this, false);
  await cardChoseButton.click(); // choose most complex level for tests
});

Given(/^I navigate back to the main page$/, async function () {
  this.webDriverLogger.info(`Step: I navigate back to the main page`);
  // Navigate back to the main page
  await navigateTo.call(this, '/wallets/add');
  await waitUntilUrlEquals.call(this, '/wallets/add');
  await this.waitForElement(walletAddComponent);
});

Then(/^I accept uri registration$/, async function () {
  this.webDriverLogger.info(`Step: I accept uri registration`);
  await acceptUriPrompt(this);
});

async function acceptUriPrompt(world: any) {
  if (world.getBrowser() !== 'firefox') {
    await world.waitForElement(uriPromptForm);
    await world.click(allowButton);
    await world.waitForElement(uriAcceptComponent);
    await world.click(finishButton);
  }
}

Given(/^I have opened the extension$/, async function () {
  this.webDriverLogger.info(`Step: I have opened the extension`);
  await this.get(this.getExtensionUrl());
  const browserName = await this.getBrowser();
  if (browserName === 'firefox') {
    await this.driver.manage().window().maximize();
  }
  // this string is for local debug only. It sets the same resolution as on Github virtual display
  if (process.env.LIKE_GITHUB_DISPLAY != null && process.env.LIKE_GITHUB_DISPLAY === '1') {
    this.driver.manage().window().setRect({ x: 0, y: 0, width: 989, height: 1113 });
  }
});

Given(/^I refresh the page$/, async function () {
  this.webDriverLogger.info(`Step: I refresh the page`);
  await this.driver.navigate().refresh();
  // wait for page to refresh
  await this.driver.sleep(halfSecond);
  await this.waitForElement(root);
});

Given(/^I restart the browser$/, async function () {
  this.webDriverLogger.info(`Step: I restart the browser`);
  await this.driver.manage().deleteAllCookies();
  await this.driver.navigate().refresh();
  // wait for page to refresh
  await this.driver.sleep(halfSecond);
  await this.waitForElement(root);
});

Given(/^There is no wallet stored$/, async function () {
  this.webDriverLogger.info(`Step: There is no wallet stored`);
  await restoreWalletsFromStorage(this);
  await this.waitForElement(walletAddComponent);
});

Then(/^I click then button labeled (.*)$/, async function (buttonName) {
  this.webDriverLogger.info(`Step: I click then button labeled ${buttonName}`);
  await this.click({ locator: `//button[contains(text(), ${buttonName})]`, method: 'xpath' });
});

Given(/^I export a snapshot named ([^"]*)$/, async function (snapshotName) {
  this.webDriverLogger.info(`Step: I export a snapshot named ${snapshotName}`);
  await exportYoroiSnapshot(this, snapshotsDir.concat(snapshotName));
});

Given(/^I import a snapshot named ([^"]*)$/, async function (snapshotName) {
  this.webDriverLogger.info(`Step: I import a snapshot named ${snapshotName}`);
  await importYoroiSnapshot(this, snapshotsDir.concat(snapshotName));

  // refresh page to trigger migration
  await this.driver.navigate().refresh();
  // wait for page to refresh
  await this.driver.sleep(oneSecond + halfSecond);
  await this.waitForElementNotPresent(loadingSpinnerComponent);
  await this.waitForElement(root);
});

async function setLedgerWallet(client, serial) {
  await client.driver.executeAsyncScript((data, done) => {
    window.yoroi.stores.substores.ada.ledgerConnect
      .setSelectedMockWallet(data)
      .then(done)
      .catch(err => done(err));
  }, serial);
}
// deprecated
Given(/^I connected Ledger device ([^"]*)$/, async function (serial) {
  this.webDriverLogger.info(`Step: I connected Ledger device ${serial}`);
  await setLedgerWallet(this, serial);
});

async function setTrezorWallet(client, deviceId) {
  await client.driver.executeAsyncScript((data, done) => {
    window.yoroi.stores.substores.ada.trezorConnect
      .setSelectedMockWallet(data)
      .then(done)
      .catch(err => done(err));
  }, deviceId);
}
Given(/^I connected Trezor device ([^"]*)$/, async function (deviceId) {
  this.webDriverLogger.info(`Step: I connected Trezor device ${deviceId}`);
  await setTrezorWallet(this, deviceId);
});

Given(/^I connected Trezor emulator device$/, async function () {
  // select connecting a HW wallet
  this.webDriverLogger.info(`Step: I connected Trezor device`);
  await this.click(connectHwButton);
  // pick up currency
  await this.waitForElement(pickUpCurrencyDialog);
  await this.click(getCurrencyButton('cardano'));
  // select the trezor wallet
  await this.waitForElement(hwOptionsDialog);
  await this.click(trezorWalletButton);
  // select the Shelley era
  await this.waitForElement(eraOptionsDialog);
  await this.click(shelleyEraButton);
  // Confirm action twice
  await this.waitForElement(trezorConnectDialog);
  await this.click(trezorConfirmButton);
  await this.click(trezorConfirmButton);
  await switchToTrezorAndAllow(this);
  await allowPubKeysAndSwitchToYoroi(this);
  // save the emulator as is
  await this.waitForElement(saveDialog);
  const name = await this.getValue(walletNameInput);
  expect(name).to.be.equal('Emulator');
  await this.click(saveButton);
  this.webDriverLogger.info(`Step: Wallet is connected and saved`);
  await this.waitForElement(walletSyncingOverlayComponent);
  await this.waitForElementNotPresent(walletSyncingOverlayComponent);
  this.webDriverLogger.info(`Step: Wallet is fully synchronized`);
});

async function restoreWalletsFromStorage(client) {
  await client.driver.executeAsyncScript(done => {
    window.yoroi.stores.wallets
      .restoreWalletsFromStorage()
      .then(done)
      .catch(err => done(err));
  });
}

async function exportYoroiSnapshot(client, exportDir: string) {
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }
  await exportLocalStorage(client, exportDir);
  await exportIndexedDB(client, exportDir);
}

async function exportLocalStorage(client, exportDir: string) {
  const localStoragePath = `${exportDir}/localStorage.json`;
  const localStorage = await client.driver.executeAsyncScript(done => {
    window.yoroi.api.localStorage
      .getStorage()
      .then(done)
      .catch(err => done(err));
  });
  await writeFile(localStoragePath, localStorage);
}

async function exportIndexedDB(client, exportDir: string) {
  const indexedDBPath = `${exportDir}/indexedDB.json`;
  const indexedDB = await client.driver.executeAsyncScript(done => {
    window.yoroi.api.common
      .exportLocalDatabase(window.yoroi.stores.loading.getDatabase())
      .then(done)
      .catch(err => done(err));
  });
  await writeFile(indexedDBPath, indexedDB);
}

async function importYoroiSnapshot(client, importDir: string) {
  if (!fs.existsSync(importDir)) {
    throw new Error('The directory must exists!');
  }
  await importLocalStorage(client, importDir);
  await importIndexedDB(client, importDir);
}

async function importLocalStorage(client, importDir: string) {
  const localStoragePath = `${importDir}/localStorage.json`;
  const localStorageData = fs.readFileSync(localStoragePath).toString();
  const storage = JSON.parse(localStorageData);
  const version: string = storage['test-LAST-LAUNCH-VER'] || '0.0.0';

  // Clear anything in memory to effectively override it with the snapshot
  await client.driver.executeAsyncScript(done => {
    window.yoroi.api.localStorage
      .clear()
      .then(done)
      .catch(err => done(err));
  });

  if (satisfies(version, '<1.9.0')) {
    /**
     * Version of Yoroi <1.9.0 used localStorage exclusively
     * we mimic this behavior when importing
     */
    await client.driver.executeScript(data => {
      Object.keys(data).forEach(key => {
        window.localStorage.setItem(key, data[key]);
      });
    }, storage);
  } else {
    await client.driver.executeAsyncScript((data, done) => {
      window.yoroi.api.localStorage
        .setStorage(data)
        .then(done)
        .catch(err => done(err));
    }, storage);
  }
}

async function importIndexedDB(client, importDir: string) {
  const indexedDBPath = `${importDir}/indexedDB.json`;

  let indexedDBData;
  try {
    // some tests check for behavior based on local storage only and don't require IndexedDb
    indexedDBData = fs.readFileSync(indexedDBPath).toString();
  } catch (e) {
    return;
  }
  await client.driver.executeAsyncScript((data, done) => {
    window.yoroi.stores.loading
      .importOldDatabase(data)
      .then(done)
      .catch(err => done(err));
  }, JSON.parse(indexedDBData));
}

async function captureDbState(client) {
  const rawDb = await client.driver.executeAsyncScript(done => {
    window.yoroi.api.common
      .exportLocalDatabase(window.yoroi.stores.loading.getDatabase())
      .then(done)
      .catch(err => done(err));
  });
  return JSON.parse(rawDb.toString());
}
async function compareToCapturedDbState(client, excludeSyncTime) {
  const firstDBState = await client.getFromLocalStorage('capturedDBState');
  if (firstDBState == null) throw new Error('Db state was never captured');
  const newState = await captureDbState(client);
  if (excludeSyncTime) {
    delete firstDBState.tables.LastSyncInfo;
    delete newState.tables.LastSyncInfo;
  }
  expect(stableStringify(firstDBState.tables)).to.equal(stableStringify(newState.tables));
}

Given(/^I capture DB state snapshot$/, async function () {
  this.webDriverLogger.info(`Step: I capture DB state snapshot`);
  const capturedDBState = await captureDbState(this);
  await this.saveToLocalStorage('capturedDBState', capturedDBState);
});

Then(/^I compare to DB state snapshot$/, async function () {
  this.webDriverLogger.info(`Step: I compare to DB state snapshot`);
  await compareToCapturedDbState(this, false);
});

Then(/^I compare to DB state snapshot excluding sync time$/, async function () {
  this.webDriverLogger.info(`Step: I compare to DB state snapshot excluding sync time`);
  await compareToCapturedDbState(this, true);
});

Then(/^Revamp. I switch to revamp version$/, async function () {
  this.webDriverLogger.info(`Step: Revamp. I switch to revamp version`);
  await goToSettings(this);
  this.webDriverLogger.info(`Step: -----> We are in the Settings`);
  await selectSubmenuSettings(this, 'general');
  this.webDriverLogger.info(`Step: -----> We are in the Settings - General`);
  await this.click(revampThemeRadiobutton);
  this.webDriverLogger.info(`Step: -----> The revamp theme is selected`);
  await this.click(walletButton);
  this.webDriverLogger.info(`Step: -----> Switched back to a wallet`);
});

Then(/^Revamp. I go to the wallet ([^"]*)$/, async function (walletName) {
  this.webDriverLogger.info(`Step: Revamp. I go to the wallet ${walletName}`);
  await this.click(walletButton);

  const restoreInfo = testWallets[walletName];
  const walletButtonInRow = await getWalletButtonByPlate(this, restoreInfo.plate);
  await walletButtonInRow.click();
  await this.waitForElement(walletSummaryBox);
});

When(/^I go to General Settings$/, async function () {
  await goToSettings(this);
  await selectSubmenuSettings(this, 'general');
});

Then(/^Debug. Take screenshot$/, async function () {
  const currentTime = getLogDate();
  await takeScreenshot(this.driver, `debug_${currentTime}`);
  await takePageSnapshot(this.driver, `debug_${currentTime}`);
  const browserName = await this.getBrowser();
  if (browserName !== 'firefox') {
    await getLogs(this.driver, `debug_${currentTime}`, logging.Type.BROWSER);
    await getLogs(this.driver, `debug_${currentTime}`, logging.Type.DRIVER);
  }
});

Then(/^Debug. Make driver sleep for 2 seconds$/, async function () {
  await this.driver.sleep(2 * oneSecond);
});
