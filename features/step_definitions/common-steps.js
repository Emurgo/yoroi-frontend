// @flow

import { Before, BeforeAll, Given, After, AfterAll, setDefinitionFunctionWrapper } from 'cucumber';
import { getMockServer, closeMockServer } from '../support/mockServer';
import { buildFeatureData, getFeatureData, getFakeAddresses } from '../support/mockDataBuilder';
import i18nHelper from '../support/helpers/i18n-helpers';

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
      // path logic
      const dir = `${screenshotsDir}/${testProgress.scenarioName}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      const path = `${dir}/${testProgress.step}_${testProgress.lineNum}-${cleanString}.png`;

      const screenshot = await this.driver.takeScreenshot();
      await writeFile(path, screenshot, 'base64');
    }

    testProgress.step += 1;
    return ret;
  };
});

Given(/^I am testing "([^"]*)"$/, feature => {
  buildFeatureData(feature);
});

Given(/^I have completed the basic setup$/, async function () {
  // Default Profile Configs (language and terms of use)
  await this.waitForElement('.LanguageSelectionForm_component');

  await i18nHelper.setActiveLanguage(this.driver);

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

function refreshWallet(client) {
  return client.driver.executeAsyncScript((done) => {
    window.yoroi.stores.substores.ada.wallets.refreshWalletsData()
      .then(done)
      .catch(err => done(err));
  });
}

async function storeWallet(client, walletName) {
  const featureData = getFeatureData();
  if (!featureData) {
    return;
  }
  const { masterKey, wallet, cryptoAccount, adaAddresses, walletInitialData } = featureData;
  if (wallet === undefined) {
    return;
  }
  wallet.cwMeta.cwName = walletName;

  await client.saveToLocalStorage('WALLET', { adaWallet: wallet, masterKey });
  await client.saveToLocalStorage('ACCOUNT', cryptoAccount);

  /* Obs: If "with $number addresses" is include in the sentence,
     we override the wallet with fake addresses" */
  if (walletName &&
      walletInitialData &&
      walletInitialData[walletName] &&
      walletInitialData[walletName].totalAddresses
  ) {
    client.saveAddressesToDB(getFakeAddresses(
      walletInitialData[walletName].totalAddresses,
      walletInitialData[walletName].addressesStartingWith
    ));
  } else {
    client.saveAddressesToDB(adaAddresses);
  }
  await refreshWallet(client);
}
