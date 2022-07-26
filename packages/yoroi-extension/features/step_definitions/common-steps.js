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
} from 'cucumber';
import * as CardanoServer from '../mock-chain/mockCardanoServer';
import * as ErgoServer from '../mock-chain/mockErgoServer';
import { By, logging } from 'selenium-webdriver';
import { enterRecoveryPhrase } from '../support/helpers/helpers';
import { testWallets } from '../mock-chain/TestWallets';
import * as ErgoImporter from '../mock-chain/mockErgoImporter';
import * as CardanoImporter from '../mock-chain/mockCardanoImporter';
import {
  testRunsDataDir,
  snapshotsDir,
  } from '../support/helpers/common-constants';
import { expect } from 'chai';
import { satisfies } from 'semver';
// eslint-disable-next-line import/named
import { truncateLongName } from '../../app/utils/formatters';
import stableStringify from 'json-stable-stringify';
import type { RestorationInput } from '../mock-chain/TestWallets';
import { waitUntilUrlEquals, navigateTo } from '../support/helpers/route-helpers';
import { promises as fsAsync } from 'fs';
import {
  selectSubmenuSettings,
  getComplexityLevelButton,
  goToSettings,
} from './general-settings-steps';
import type { LocatorObject } from '../support/webdriver';
import { walletButton } from '../pages/sidebarPage';
import { getWalletButtonByPlate } from '../pages/walletsListPage';

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
  rimraf.sync(testRunsDataDir);
  fs.mkdirSync(testRunsDataDir);
  setDefaultTimeout(20 * 1000);

  CardanoServer.getMockServer({});
  ErgoServer.getMockServer({});
});

AfterAll(() => {
  CardanoServer.closeMockServer();
  ErgoServer.closeMockServer();
});

Before(scenario => {
  const pathItems = scenario.sourceLocation.uri.split('/');
  // eslint-disable-next-line no-console
  console.log(
    `\n### ${pathItems[pathItems.length - 2]}. The scenario "${scenario.pickle.name}" has started`
  );
  CardanoServer.setExpectedTx(undefined);
  ErgoServer.setExpectedTx(undefined);
  // cleanup scenario name so it is folder-name friendly
  testProgress.scenarioName = scenario.pickle.name.replace(/[^0-9a-z_ ]/gi, '');
  testProgress.lineNum = scenario.sourceLocation.line;
  testProgress.step = 0;
});

Before({ tags: 'not @TestAssuranceChain' }, () => {
  CardanoImporter.resetChain(CardanoImporter.MockChain.Standard);
  ErgoImporter.resetChain();
});
Before({ tags: '@TestAssuranceChain' }, () => {
  CardanoImporter.resetChain(CardanoImporter.MockChain.TestAssurance);
});

Before({ tags: '@serverDown' }, () => {
  CardanoServer.closeMockServer();
  ErgoServer.closeMockServer();
});
After({ tags: '@serverDown' }, () => {
  CardanoServer.getMockServer({});
  ErgoServer.getMockServer({});
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

After(async function (scenario) {
  this.sendToAllLoggers(`#### The scenario "${scenario.pickle.name}" has done ####`);
  if (scenario.result.status === 'failed') {
    await takeScreenshot(this.driver, 'failedStep');
    await takePageSnapshot(this.driver, 'failedStep');
    if (this.getBrowser !== 'firefox') {
      await getLogs(this.driver, 'failedStep', logging.Type.BROWSER);
      await getLogs(this.driver, 'failedStep', logging.Type.DRIVER);
    }
  }
  await this.driver.quit();
});

export async function getPlates(customWorld: any): Promise<any> {
  // check plate in confirmation dialog
  let plateElements = await customWorld.driver.findElements(
    By.css('.WalletRestoreVerifyDialog_plateIdSpan')
  );

  // this makes this function also work for wallets that already exist
  if (plateElements.length === 0) {
    plateElements = await customWorld.driver.findElements(By.css('.NavPlate_plate'));
  }
  return plateElements;
}

const writeFile = promisify(fs.writeFile);

// Steps that contain these patterns will trigger screenshots:
const SCREENSHOT_STEP_PATTERNS = ['I should see', 'I see', 'I click', 'by clicking'];

/** Wrap every step to take screenshots for UI-based testing */
setDefinitionFunctionWrapper((fn, _, pattern) => {
  if (!pattern) {
    return fn;
  }
  return async function (...args) {
    const ret = await fn.apply(this, args);

    // Regex patterns contain non-ascii characters.
    // We want to remove this to get a filename-friendly string
    const cleanString = pattern.toString().replace(/[^0-9a-z_ ]/gi, '');
    if (SCREENSHOT_STEP_PATTERNS.some(pat => cleanString.includes(pat))) {
      await takeScreenshot(this.driver, cleanString);
      await takePageSnapshot(this.driver, cleanString);

      const browserName = await this.getBrowser();
      if (browserName !== 'firefox') {
        await getLogs(this.driver, cleanString, logging.Type.BROWSER);
        await getLogs(this.driver, cleanString, logging.Type.DRIVER);
      }
    }

    testProgress.step += 1;
    return ret;
  };
});

async function createDirInTestRunsData(driver, subdirectoryName) {
  const cap = await driver.getCapabilities();
  const browserName = cap.getBrowserName();
  const dir = `${testRunsDataDir}/${browserName}/${testProgress.scenarioName}/${subdirectoryName}`;
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
 * @param loggingType The logging type required. Select between logging.Type.DRIVER and logging.Type.BROWSER.
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
  const logEntries = await driver.manage().logs().get(loggingType);
  const jsonLogs = logEntries.map(l => l.toJSON());
  await fsAsync.writeFile(consoleLogPath, JSON.stringify(jsonLogs));
}

async function inputMnemonicForWallet(
  customWorld: any,
  walletName: string,
  restoreInfo: RestorationInput
): Promise<void> {
  await customWorld.input({ locator: "input[name='walletName']", method: 'css' }, restoreInfo.name);
  await enterRecoveryPhrase(customWorld, restoreInfo.mnemonic);
  await customWorld.input(
    { locator: "input[name='walletPassword']", method: 'css' },
    restoreInfo.password
  );
  await customWorld.input(
    { locator: "input[name='repeatPassword']", method: 'css' },
    restoreInfo.password
  );
  await customWorld.click({ locator: '.WalletRestoreDialog .primary', method: 'css' });

  const plateElements = await getPlates(customWorld);
  const plateText = await plateElements[0].getText();
  expect(plateText).to.be.equal(restoreInfo.plate);

  await customWorld.click({ locator: '.confirmButton', method: 'css' });
  await customWorld.waitUntilText(
    { locator: '.NavPlate_name', method: 'css' },
    truncateLongName(walletName)
  );
}

export async function checkErrorByTranslationId(
  client: Object,
  errorSelector: LocatorObject,
  errorObject: Object
) {
  await client.waitUntilText(errorSelector, await client.intl(errorObject.message), 15000);
}

Then(/^I pause the test to debug$/, async function () {
  this.webDriverLogger.info(`Step: I pause the test to debug`);
  await this.waitForElement({ locator: '.element_that_does_not_exist', method: 'css' });
});

Given(/^There is an Ergo wallet stored named ([^"]*)$/, async function (walletName) {
  this.webDriverLogger.info(`Step: There is an Ergo wallet stored named ${walletName}`);
  const restoreInfo = testWallets[walletName];
  expect(restoreInfo).to.not.equal(undefined);

  await this.click({ locator: '.WalletAdd_btnRestoreWallet', method: 'css' });

  await this.waitForElement({ locator: '.PickCurrencyOptionDialog', method: 'css' });
  await this.click({ locator: '.PickCurrencyOptionDialog_ergo', method: 'css' });

  await this.waitForElement({ locator: '.WalletRestoreOptionDialog', method: 'css' });

  await this.click({ locator: '.WalletRestoreOptionDialog_restoreNormalWallet', method: 'css' });
  await this.waitForElement({ locator: '.WalletRestoreDialog', method: 'css' });

  await inputMnemonicForWallet(this, walletName, restoreInfo);
});

Given(/^There is a Shelley wallet stored named ([^"]*)$/, async function (walletName) {
  this.webDriverLogger.info(`Step: There is a Shelley wallet stored named ${walletName}`);
  const restoreInfo = testWallets[walletName];
  expect(restoreInfo).to.not.equal(undefined);

  await this.click({ locator: '.WalletAdd_btnRestoreWallet', method: 'css' });

  await this.waitForElement({ locator: '.PickCurrencyOptionDialog', method: 'css' });
  await this.click({ locator: '.PickCurrencyOptionDialog_cardano', method: 'css' });

  await this.waitForElement({ locator: '.WalletRestoreOptionDialog', method: 'css' });

  await this.click({ locator: '.WalletRestoreOptionDialog_restoreNormalWallet', method: 'css' });
  await this.click({ locator: '.WalletEraOptionDialog_bgShelleyMainnet', method: 'css' });
  await this.waitForElement({ locator: '.WalletRestoreDialog', method: 'css' });

  await inputMnemonicForWallet(this, walletName, restoreInfo);
});

Given(/^There is a Byron wallet stored named ([^"]*)$/, async function (walletName) {
  this.webDriverLogger.info(`Step: There is a Byron wallet stored named ${walletName}`);
  const restoreInfo = testWallets[walletName];
  expect(restoreInfo).to.not.equal(undefined);

  await this.click({ locator: '.WalletAdd_btnRestoreWallet', method: 'css' });

  await this.waitForElement({ locator: '.PickCurrencyOptionDialog', method: 'css' });
  await this.click({ locator: '.PickCurrencyOptionDialog_cardano', method: 'css' });

  await this.waitForElement({ locator: '.WalletRestoreOptionDialog', method: 'css' });

  await this.click({ locator: '.WalletRestoreOptionDialog_restoreNormalWallet', method: 'css' });
  await this.click({ locator: '.WalletEraOptionDialog_bgByronMainnet', method: 'css' });
  await this.waitForElement({ locator: '.WalletRestoreDialog', method: 'css' });

  await inputMnemonicForWallet(this, walletName, restoreInfo);
});

Given(/^I have completed the basic setup$/, async function () {
  this.webDriverLogger.info(`Step: I have completed the basic setup`);
  // language select page
  await this.waitForElement({ locator: '.LanguageSelectionForm_component', method: 'css' });
  await this.click({ locator: '//button[text()="Continue"]', method: 'xpath' });
  // ToS page
  await this.waitForElement({ locator: '.TermsOfUseForm_component', method: 'css' });
  const tosClassElement = await this.driver.findElement(By.css('.TermsOfUseForm_component'));
  const checkbox = await tosClassElement.findElement(By.xpath('//input[@type="checkbox"]'));
  await checkbox.click();
  await this.click({ locator: '//button[text()="Continue"]', method: 'xpath' });
  // uri prompt page
  await acceptUriPrompt(this);
  await this.waitForElement({ locator: '.WalletAdd_component', method: 'css' });
});

Given(/^I switched to the advanced level$/, async function () {
  this.webDriverLogger.info(`Step: I switched to the advanced level`);
  // Navigate to the general settings screen
  await navigateTo.call(this, '/settings');
  await navigateTo.call(this, '/settings/general');
  await waitUntilUrlEquals.call(this, '/settings/general');
  await this.waitForElement({ locator: '.SettingsLayout_component', method: 'css' });
  // Click on secondary menu "levelOfComplexity" item
  await selectSubmenuSettings(this, 'levelOfComplexity');
  // Select the most complex level
  const cardChoseButton = await getComplexityLevelButton(this, false);
  await cardChoseButton.click(); // choose most complex level for tests

  // Navigate back to the main page
  await navigateTo.call(this, '/wallets/add');
  await waitUntilUrlEquals.call(this, '/wallets/add');
  await this.waitForElement({ locator: '.WalletAdd_component', method: 'css' });
});

Then(/^I accept uri registration$/, async function () {
  this.webDriverLogger.info(`Step: I accept uri registration`);
  await acceptUriPrompt(this);
});

async function acceptUriPrompt(world: any) {
  if (world.getBrowser() !== 'firefox') {
    await world.waitForElement({ locator: '.UriPromptForm_component', method: 'css' });
    await world.click({ locator: '.allowButton', method: 'css' });
    await world.waitForElement({ locator: '.UriAccept_component', method: 'css' });
    await world.click({ locator: '.finishButton', method: 'css' });
  }
}

Given(/^I have opened the extension$/, async function () {
  this.webDriverLogger.info(`Step: I have opened the extension`);
  await this.driver.get(this.getExtensionUrl());
  const browserName = await this.getBrowser();
  if (browserName === 'firefox') {
    await this.driver.manage().window().maximize();
  }
});

Given(/^I refresh the page$/, async function () {
  this.webDriverLogger.info(`Step: I refresh the page`);
  await this.driver.navigate().refresh();
  // wait for page to refresh
  await this.driver.sleep(500);
  await this.waitForElement({ locator: '.YoroiClassic', method: 'css' });
});

Given(/^I restart the browser$/, async function () {
  this.webDriverLogger.info(`Step: I restart the browser`);
  await this.driver.manage().deleteAllCookies();
  await this.driver.navigate().refresh();
  // wait for page to refresh
  await this.driver.sleep(500);
  await this.waitForElement({ locator: '.YoroiClassic', method: 'css' });
});

Given(/^There is no wallet stored$/, async function () {
  this.webDriverLogger.info(`Step: There is no wallet stored`);
  await restoreWalletsFromStorage(this);
  await this.waitForElement({ locator: '.WalletAdd_component', method: 'css' });
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
  await this.driver.sleep(1500);
  await this.waitForElement({ locator: '.YoroiClassic', method: 'css' });
});

async function setLedgerWallet(client, serial) {
  await client.driver.executeAsyncScript((data, done) => {
    window.yoroi.stores.substores.ada.ledgerConnect
      .setSelectedMockWallet(data)
      .then(done)
      .catch(err => done(err));
  }, serial);
}
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

let capturedDbState = undefined;
async function captureDbStae(client) {
  const rawDb = await client.driver.executeAsyncScript(done => {
    window.yoroi.api.common
      .exportLocalDatabase(window.yoroi.stores.loading.getDatabase())
      .then(done)
      .catch(err => done(err));
  });
  capturedDbState = JSON.parse(rawDb.toString());
}
async function compareToCapturedDbState(client, excludeSyncTime) {
  if (capturedDbState == null) throw new Error('Db state was never captured');
  const rawDb = await client.driver.executeAsyncScript(done => {
    window.yoroi.api.common
      .exportLocalDatabase(window.yoroi.stores.loading.getDatabase())
      .then(done)
      .catch(err => done(err));
  });
  const newState = JSON.parse(rawDb.toString());
  if (excludeSyncTime) {
    delete capturedDbState.tables.LastSyncInfo;
    delete newState.tables.LastSyncInfo;
  }
  expect(stableStringify(capturedDbState.tables)).to.equal(stableStringify(newState.tables));
}

Given(/^I capture DB state snapshot$/, async function () {
  this.webDriverLogger.info(`Step: I capture DB state snapshot`);
  await captureDbStae(this);
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
  await selectSubmenuSettings(this, 'general');
  const revampButton = await this.driver.findElement(By.id('switchToRevampButton'));
  await revampButton.click();
});

Then(/^Revamp. I go to the wallet ([^"]*)$/, async function (walletName) {
  this.webDriverLogger.info(`Step: Revamp. I go to the wallet ${walletName}`);
  await this.click(walletButton);

  const restoreInfo = testWallets[walletName];
  const walletButtonInRow = await getWalletButtonByPlate(this, restoreInfo.plate);
  await walletButtonInRow.click();
});
