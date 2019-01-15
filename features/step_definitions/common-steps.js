// @flow

import { BeforeAll, Given, After, AfterAll } from 'cucumber';
import { getMockServer, closeMockServer } from '../support/mockServer';
import { buildFeatureData, getFeatureData, getFakeAddresses } from '../support/mockDataBuilder';
import i18nHelper from '../support/helpers/i18n-helpers';

BeforeAll(() => {
  getMockServer({});
});

AfterAll(() => {
  closeMockServer();
});

After(async function () {
  await this.driver.quit();
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

Given(/^I have opened the chrome extension$/, async function () {
  // Extension id is determinisitically calculated based on pubKey used to generate the crx file
  // so we can just hardcode this value if we keep e2etest-key.pem file
  // https://stackoverflow.com/a/10089780/3329806
  await this.driver.get('chrome-extension://bdlknlffjjmjckcldekkbejaogpkjphg/main_window.html');
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
