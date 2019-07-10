// @flow

import { Before, BeforeAll, Given, Then, After, AfterAll, setDefinitionFunctionWrapper, setDefaultTimeout } from 'cucumber';
import { getMockServer, closeMockServer } from '../mock-chain/mockServer';
import { By } from 'selenium-webdriver';
import { enterRecoveryPhrase, assertPlate } from './wallet-restoration-steps';
import { testWallets } from '../mock-chain/TestWallets';
import { resetChain, serverIssue, serverFixed } from '../mock-chain/mockImporter';
import { expect } from 'chai';

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

  getMockServer({});
});

AfterAll(() => {
  closeMockServer();
});

Before((scenario) => {
  // cleanup scenario name so it is folder-name friendly
  testProgress.scenarioName = scenario.pickle.name.replace(/[^0-9a-z_ ]/gi, '');
  testProgress.lineNum = scenario.sourceLocation.line;
  testProgress.step = 0;

  // reset our mock chain to avoid modifications bleeding into other tests
  resetChain();
});

Before({ tags: '@serverDown' }, () => {
  closeMockServer();
});

After({ tags: '@serverDown' }, () => {
  getMockServer({});
});

Before({ tags: '@serverMaintenance' }, () => {
  serverIssue();
});

After({ tags: '@serverMaintenance' }, () => {
  serverFixed();
});

Before({ tags: '@invalidWitnessTest' }, () => {
  closeMockServer();
  getMockServer({
    signedTransaction: (req, res) => {
      res.status(400).jsonp({
        message: 'Invalid witness'
      });
    }
  });
});

After({ tags: '@invalidWitnessTest' }, () => {
  closeMockServer();
  getMockServer({});
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

Given(/^There is a wallet stored named ([^"]*)$/, async function (walletName) {
  const restoreInfo = testWallets[walletName];
  expect(restoreInfo).to.not.equal(undefined);

  await this.click('.WalletAdd_btnRestoreWallet');
  await this.waitForElement('.WalletRestoreOptionDialog');

  await this.click('.WalletRestoreOptionDialog_restoreNormalWallet');
  await this.waitForElement('.WalletRestoreDialog');

  await this.input("input[name='walletName']", restoreInfo.name);
  await enterRecoveryPhrase(
    this,
    restoreInfo.mnemonic,
  );
  await this.input("input[name='walletPassword']", restoreInfo.password);
  await this.input("input[name='repeatPassword']", restoreInfo.password);
  await this.click('.WalletRestoreDialog .primary');
  await assertPlate(this, restoreInfo.plate);
  await this.click('.confirmButton');
  await this.waitUntilText('.WalletTopbarTitle_walletName', walletName.toUpperCase());
});

Given(/^I have completed the basic setup$/, async function () {
  // langauge select page
  await this.waitForElement('.LanguageSelectionForm_component');
  await this.click('.LanguageSelectionForm_submitButton');

  // ToS page
  await this.waitForElement('.TermsOfUseForm_component');
  await this.click('.SimpleCheckbox_check');
  await this.click('.TermsOfUseForm_submitButton');

  // uri prompt page
  if (this.getBrowser() !== 'firefox') {
    await this.waitForElement('.UriPromptForm_component');
    await this.click('.allowButton');
    await this.waitForElement('.UriAccept_component');
    await this.click('.finishButton');
  }
});

Given(/^I have opened the extension$/, async function () {
  await this.driver.get(this.getExtensionUrl());
});

Given(/^I refresh the page$/, async function () {
  await this.driver.navigate().refresh();
  await this.driver.sleep(400); // give time for page to reload
});

Given(/^I restart the browser$/, async function () {
  await this.driver.manage().deleteAllCookies();
  await this.driver.navigate().refresh();
  await this.driver.sleep(500); // give time for page to reload
});

Given(/^There is no wallet stored$/, async function () {
  await refreshWallet(this);
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
});

function refreshWallet(client) {
  return client.driver.executeAsyncScript((done) => {
    window.yoroi.stores.substores.ada.wallets.refreshWalletsData()
      .then(done)
      .catch(err => done(err));
  });
}

async function exportYoroiSnapshot(client, exportDir: string) {
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }
  exportLocalStorage(client, exportDir);
  exportIndexedDB(client, exportDir);
}

async function exportLocalStorage(client, exportDir: string) {
  const localStoragePath = `${exportDir}/localStorage.json`;
  const localStorage = await client.driver.executeAsyncScript((done) => {
    window.yoroi.api.localStorage.getLocalStorage()
      .then(done)
      .catch(err => done(err));
  });
  await writeFile(localStoragePath, localStorage);
}

async function exportIndexedDB(client, exportDir: string) {
  const indexedDBPath = `${exportDir}/indexedDB.json`;
  const indexedDB = await client.driver.executeAsyncScript((done) => {
    window.yoroi.api.ada.exportLocalDatabase()
      .then(done)
      .catch(err => done(err));
  });
  await writeFile(indexedDBPath, indexedDB);
}

async function importYoroiSnapshot(client, importDir: string) {
  if (!fs.existsSync(importDir)) {
    throw new Error('The directory must exists!');
  }
  importLocalStorage(client, importDir);
  importIndexedDB(client, importDir);
}

async function importLocalStorage(client, importDir: string) {
  const localStoragePath = `${importDir}/localStorage.json`;
  const localStorageData = fs.readFileSync(localStoragePath);
  await client.driver.executeScript((data) => {
    window.yoroi.api.localStorage.setLocalStorage(data);
    // $FlowFixMe Flow thinks that localStorageData is of type Buffer
  }, JSON.parse(localStorageData));
}

async function importIndexedDB(client, importDir: string) {
  const indexedDBPath = `${importDir}/indexedDB.json`;
  const indexedDBData = fs.readFileSync(indexedDBPath);
  await client.driver.executeScript((data) => {
    window.yoroi.api.ada.importLocalDatabase(data);
    // $FlowFixMe Flow thinks that indexedDBData is of type Buffer
  }, JSON.parse(indexedDBData));
}
