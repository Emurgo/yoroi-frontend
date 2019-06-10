// @flow

import { Before, BeforeAll, Given, Then, After, AfterAll, setDefinitionFunctionWrapper, setDefaultTimeout } from 'cucumber';
import { getMockServer, closeMockServer } from '../mock-chain/mockServer';
import i18nHelper from '../support/helpers/i18n-helpers';
import { By } from 'selenium-webdriver';
import { enterRecoveryPhrase, assertPlate } from './wallet-restoration-steps';
import { testWallets } from '../mock-chain/TestWallets';
import { resetChain } from '../mock-chain/mockImporter';
import { expect } from 'chai';

const { promisify } = require('util');
const fs = require('fs');
const rimraf = require('rimraf');

const screenshotsDir = './screenshots/';

/** We need to keep track of our progress in testing to give unique names to screenshots */
const testProgress = {
  scenarioName: '',
  lineNum: 0, // we need this to differentiate scenarios with multiple "examples"
  step: 0
};

BeforeAll(() => {
  rimraf.sync(screenshotsDir);
  fs.mkdirSync(screenshotsDir);
  setDefaultTimeout(30 * 1000);

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

    if (cleanString.includes('I should see')) {
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
  await this.click('.restoreWalletButton');
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
  // Default Profile Configs (language and terms of use)
  await this.waitForElement('.LanguageSelectionForm_component');

  await i18nHelper.setActiveLanguage(this.driver);

  await this.click('.LanguageSelectionForm_submitButton');
  await this.waitForElement('.TermsOfUseForm_component');
  await this.driver.executeScript(() => {
    window.yoroi.actions.profile.acceptTermsOfUse.trigger();
  });
});

Given(/^I have opened the extension$/, async function () {
  await this.driver.get(this.getExtensionUrl());
});

Given(/^I refresh the page$/, async function () {
  await this.driver.navigate().refresh();
  await this.driver.sleep(500); // give time for page to reload
});

Given(/^I restart the browser$/, async function () {
  await this.driver.manage().deleteAllCookies();
  await this.driver.navigate().refresh();
  await this.driver.sleep(500); // give time for page to reload
});

Given(/^There is no wallet stored$/, async function () {
  await refreshWallet(this);
  await this.waitForElement('.WalletAdd');
});

Then(/^I click then button labeled (.*)$/, async function (buttonName) {
  await this.click(`//button[contains(text(), ${buttonName})]`, By.xpath);
});


function refreshWallet(client) {
  return client.driver.executeAsyncScript((done) => {
    window.yoroi.stores.substores.ada.wallets.refreshWalletsData()
      .then(done)
      .catch(err => done(err));
  });
}
