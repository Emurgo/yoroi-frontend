// @flow

import { Before, BeforeAll, Given, Then, After, AfterAll, setDefinitionFunctionWrapper } from 'cucumber';
import { getMockServer, closeMockServer } from '../support/mockServer';
import { buildFeatureData, getFeatureData, getFakeAddresses } from '../support/mockDataBuilder';
import i18nHelper from '../support/helpers/i18n-helpers';
import { By } from 'selenium-webdriver';

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

Given(/^I am testing "([^"]*)"$/, feature => {
  buildFeatureData(feature);
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
});

Given(/^I restart the browser$/, async function () {
  await this.driver.manage().deleteAllCookies();
  await this.driver.navigate().refresh();
});

Given(/^There is no wallet stored$/, async function () {
  await refreshWallet(this);
  await this.waitForElement('.WalletAdd');
});

Given(/^There is a wallet stored named (.*)$/, async function (walletName) {
  await storeWallet(this, walletName);
  await this.waitUntilText('.WalletTopbarTitle_walletName', walletName.toUpperCase());
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

/**
 * Note: this function is called multiple times
 * Once for each wallet in the inheritance hierarchy of the test
 * Notably, if the test loads a wallet in "Background" and again in a specific test
 */
async function storeWallet(client, walletName) {
  const featureData = getFeatureData();
  if (!featureData) {
    return;
  }
  const {
    masterKey,
    wallet,
    cryptoAccount,
    adaAddresses,
    walletInitialData,
    usedAddresses
  } = featureData;

  if (wallet === undefined) {
    return;
  }
  wallet.cwMeta.cwName = walletName;

  const totalGeneratedAddresses = (
    walletName &&
    walletInitialData &&
    walletInitialData[walletName] &&
    walletInitialData[walletName].totalAddresses
  ) || 0;

  await client.saveToLocalStorage('WALLET', {
    adaWallet: wallet,
    masterKey,
    lastReceiveAddressIndex: Math.max(
      // usedAddresses.length is not accurate here unless used addresses are all sequential
      // good enough for our tests
      usedAddresses ? usedAddresses.length - 1 : 0,
      0
    )
  });
  await client.saveToLocalStorage('ACCOUNT', cryptoAccount);

  let externalAddressesToSave = [];

  /* Obs: If "with $number addresses" is include in the sentence,
     we override the wallet with fake addresses" */
  if (totalGeneratedAddresses) {
    externalAddressesToSave = getFakeAddresses(
      totalGeneratedAddresses,
      // $FlowFixMe walletInitialData has to exist for this branch to be hit so ignore the error
      walletInitialData[walletName].addressesStartingWith,
    );
  } else if (adaAddresses) {
    externalAddressesToSave = adaAddresses;
  }

  client.saveAddressesToDB(externalAddressesToSave, 'External');
  client.saveAddressesToDB([{
    cadAmount: {
      getCCoin: '0'
    },
    cadId: 'Ae2tdPwUPEZJ9HwF8zATdjWcbMTpWAMSMLMxpzdwxiou6evpT57cixBaVyh',
    cadIsUsed: false,
    account: 0,
    change: 1,
    index: 0
  }], 'Internal');

  await refreshWallet(client);
}
