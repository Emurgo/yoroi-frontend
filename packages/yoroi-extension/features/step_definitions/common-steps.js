// @flow

import { Before, BeforeAll, Given, Then, After, AfterAll, setDefinitionFunctionWrapper, setDefaultTimeout } from 'cucumber';
import * as CardanoServer from '../mock-chain/mockCardanoServer';
import * as ErgoServer from '../mock-chain/mockErgoServer';
import { By } from 'selenium-webdriver';
import { enterRecoveryPhrase, getPlates } from './wallet-restoration-steps';
import { testWallets } from '../mock-chain/TestWallets';
import * as ErgoImporter from '../mock-chain/mockErgoImporter';
import * as CardanoImporter from '../mock-chain/mockCardanoImporter';
import { expect } from 'chai';
import {
  satisfies,
} from 'semver';
import { truncateLongName, } from '../../app/utils/formatters';
import stableStringify from 'json-stable-stringify';
import type { RestorationInput } from '../mock-chain/TestWallets';

const { promisify } = require('util');
const fs = require('fs');
const rimraf = require('rimraf');

const screenshotsDir = './screenshots/';
const snapshotsDir = './features/yoroi_snapshots/';

/** We need to keep track of our progress in testing to give unique names to screenshots */
const testProgress = {
  scenarioName: '',
  lineNum: 0, // we need this to differentiate scenarios with multiple "examples"
  step: 0
};

BeforeAll(() => {
  rimraf.sync(screenshotsDir);
  fs.mkdirSync(screenshotsDir);
  setDefaultTimeout(60 * 1000);

  CardanoServer.getMockServer({});
  ErgoServer.getMockServer({});
});

AfterAll(() => {
  CardanoServer.closeMockServer();
  ErgoServer.closeMockServer();
});

Before((scenario) => {
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
        message: 'Invalid witness'
      });
    }
  });
});

After({ tags: '@invalidWitnessTest' }, () => {
  CardanoServer.closeMockServer();
  CardanoServer.getMockServer({});
});

After(async function () {
  await this.driver.quit();
});

const writeFile = promisify(fs.writeFile);

// Steps that contain these patterns will trigger screenshots:
const SCREENSHOT_STEP_PATTERNS = [
  'I should see',
  'I see',
  'I click',
  'by clicking',
];

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
    }

    testProgress.step += 1;
    return ret;
  };
});

async function takeScreenshot(driver, name) {
  // path logic
  const dir = `${screenshotsDir}/${testProgress.scenarioName}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const path = `${dir}/${testProgress.step}_${testProgress.lineNum}-${name}.png`;

  const screenshot = await driver.takeScreenshot();
  await writeFile(path, screenshot, 'base64');
}

async function inputMnemonicForWallet(
  customWorld: any,
  walletName: string,
  restoreInfo: RestorationInput,
): Promise<void> {
  await customWorld.input("input[name='walletName']", restoreInfo.name);
  await enterRecoveryPhrase(
    customWorld,
    restoreInfo.mnemonic,
  );
  await customWorld.input("input[name='walletPassword']", restoreInfo.password);
  await customWorld.input("input[name='repeatPassword']", restoreInfo.password);
  await customWorld.click('.WalletRestoreDialog .primary');

  const plateElements = await getPlates(customWorld);
  const plateText = await plateElements[0].getText();
  expect(plateText).to.be.equal(restoreInfo.plate);

  await customWorld.click('.confirmButton');
  await customWorld.waitUntilText('.NavPlate_name', truncateLongName(walletName));
}

Then(/^I pause the test to debug$/, async function () {
  await this.waitForElement('.element_that_does_not_exist');
});

Given(/^There is an Ergo wallet stored named ([^"]*)$/, async function (walletName) {
  const restoreInfo = testWallets[walletName];
  expect(restoreInfo).to.not.equal(undefined);

  await this.click('.WalletAdd_btnRestoreWallet');

  await this.waitForElement('.PickCurrencyOptionDialog');
  await this.click('.PickCurrencyOptionDialog_ergo');

  await this.waitForElement('.WalletRestoreOptionDialog');

  await this.click('.WalletRestoreOptionDialog_restoreNormalWallet');
  await this.waitForElement('.WalletRestoreDialog');

  await inputMnemonicForWallet(
    this,
    walletName,
    restoreInfo,
  );
});

Given(/^There is a Shelley wallet stored named ([^"]*)$/, async function (walletName) {
  const restoreInfo = testWallets[walletName];
  expect(restoreInfo).to.not.equal(undefined);

  await this.click('.WalletAdd_btnRestoreWallet');

  await this.waitForElement('.PickCurrencyOptionDialog');
  await this.click('.PickCurrencyOptionDialog_cardano');

  await this.waitForElement('.WalletRestoreOptionDialog');

  await this.click('.WalletRestoreOptionDialog_restoreNormalWallet');
  await this.click('.WalletEraOptionDialog_bgShelleyMainnet');
  await this.waitForElement('.WalletRestoreDialog');

  await inputMnemonicForWallet(
    this,
    walletName,
    restoreInfo,
  );
});

Given(/^There is a Byron wallet stored named ([^"]*)$/, async function (walletName) {
  const restoreInfo = testWallets[walletName];
  expect(restoreInfo).to.not.equal(undefined);

  await this.click('.WalletAdd_btnRestoreWallet');

  await this.waitForElement('.PickCurrencyOptionDialog');
  await this.click('.PickCurrencyOptionDialog_cardano');

  await this.waitForElement('.WalletRestoreOptionDialog');

  await this.click('.WalletRestoreOptionDialog_restoreNormalWallet');
  await this.click('.WalletEraOptionDialog_bgByronMainnet');
  await this.waitForElement('.WalletRestoreDialog');

  await inputMnemonicForWallet(
    this,
    walletName,
    restoreInfo,
  );
});

Given(/^I have completed the basic setup$/, async function () {
  // language select page
  await this.waitForElement('.LanguageSelectionForm_component');
  await this.click('.LanguageSelectionForm_submitButton');

  // ToS page
  await this.waitForElement('.TermsOfUseForm_component');
  await this.click('.SimpleCheckbox_check');
  await this.click('.TermsOfUseForm_submitButton');

  // complexity page
  await this.waitForElement('.ComplexityLevelForm_submitButton');
  const levels = await this.driver.findElements(By.css('.ComplexityLevelForm_submitButton'));
  await levels[levels.length - 1].click(); // choose most complex level for tests

  // uri prompt page
  await acceptUriPrompt(this);

  await this.waitForElement('.WalletAdd_component');
});

Then(/^I accept uri registration$/, async function () {
  await acceptUriPrompt(this);
});

async function acceptUriPrompt(world: any) {
  if (world.getBrowser() !== 'firefox') {
    await world.waitForElement('.UriPromptForm_component');
    await world.click('.allowButton');
    await world.waitForElement('.UriAccept_component');
    await world.click('.finishButton');
  }
}

Given(/^I have opened the extension$/, async function () {
  await this.driver.get(this.getExtensionUrl());
});

Given(/^I refresh the page$/, async function () {
  await this.driver.navigate().refresh();
  // wait for page to refresh
  await this.driver.sleep(500);
  await this.waitForElement('.YoroiClassic');
});

Given(/^I restart the browser$/, async function () {
  await this.driver.manage().deleteAllCookies();
  await this.driver.navigate().refresh();
  // wait for page to refresh
  await this.driver.sleep(500);
  await this.waitForElement('.YoroiClassic');
});

Given(/^There is no wallet stored$/, async function () {
  await restoreWalletsFromStorage(this);
  await this.waitForElement('.WalletAdd_component');
});

Then(/^I click then button labeled (.*)$/, async function (buttonName) {
  await this.click(`//button[contains(text(), ${buttonName})]`, By.xpath);
});

Given(/^I export a snapshot named ([^"]*)$/, async function (snapshotName) {
  await exportYoroiSnapshot(this, snapshotsDir.concat(snapshotName));
});

Given(/^I import a snapshot named ([^"]*)$/, async function (snapshotName) {
  await importYoroiSnapshot(this, snapshotsDir.concat(snapshotName));

  // refresh page to trigger migration
  await this.driver.navigate().refresh();
  // wait for page to refresh
  await this.driver.sleep(1500);
  await this.waitForElement('.YoroiClassic');
});

async function setLedgerWallet(client, serial) {
  await client.driver.executeAsyncScript((data, done) => {
    window.yoroi.stores.substores.ada.ledgerConnect.setSelectedMockWallet(data)
      .then(done)
      .catch(err => done(err));
  }, serial);
}
Given(/^I connected Ledger device ([^"]*)$/, async function (serial) {
  await setLedgerWallet(this, serial);
});

async function setTrezorWallet(client, deviceId) {
  await client.driver.executeAsyncScript((data, done) => {
    window.yoroi.stores.substores.ada.trezorConnect.setSelectedMockWallet(data)
      .then(done)
      .catch(err => done(err));
  }, deviceId);
}
Given(/^I connected Trezor device ([^"]*)$/, async function (deviceId) {
  await setTrezorWallet(this, deviceId);
});

async function restoreWalletsFromStorage(client) {
  await client.driver.executeAsyncScript((done) => {
    window.yoroi.stores.wallets.restoreWalletsFromStorage()
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
  const localStorage = await client.driver.executeAsyncScript((done) => {
    window.yoroi.api.localStorage.getStorage()
      .then(done)
      .catch(err => done(err));
  });
  await writeFile(localStoragePath, localStorage);
}

async function exportIndexedDB(client, exportDir: string) {
  const indexedDBPath = `${exportDir}/indexedDB.json`;
  const indexedDB = await client.driver.executeAsyncScript((done) => {
    window.yoroi.api.common.exportLocalDatabase(
      window.yoroi.stores.loading.loadPersistentDbRequest.result,
    )
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
  await client.driver.executeAsyncScript((done) => {
    window.yoroi.api.localStorage.clear()
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
      window.yoroi.api.localStorage.setStorage(data)
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
    window.yoroi.stores.loading.importOldDatabase(
      data
    )
      .then(done)
      .catch(err => done(err));
  }, JSON.parse(indexedDBData));
}

let capturedDbState = undefined;
async function captureDbStae(client) {
  const rawDb = await client.driver.executeAsyncScript((done) => {
    window.yoroi.api.common.exportLocalDatabase(
      window.yoroi.stores.loading.loadPersistentDbRequest.result,
    )
      .then(done)
      .catch(err => done(err));
  });
  capturedDbState = JSON.parse(rawDb.toString());
}
async function compareToCapturedDbState(client, excludeSyncTime) {
  if (capturedDbState == null) throw new Error('Db state was never captured');
  const rawDb = await client.driver.executeAsyncScript((done) => {
    window.yoroi.api.common.exportLocalDatabase(
      window.yoroi.stores.loading.loadPersistentDbRequest.result,
    )
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
  await captureDbStae(this);
});

Then(/^I compare to DB state snapshot$/, async function () {
  await compareToCapturedDbState(this, false);
});
Then(/^I compare to DB state snapshot excluding sync time$/, async function () {
  await compareToCapturedDbState(this, true);
});
