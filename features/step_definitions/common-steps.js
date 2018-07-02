import { BeforeAll, Given, After, AfterAll } from 'cucumber';
import { createServer } from '../support/mockServer';
import { buildMockData, getMockData, getFakeAddresses } from '../support/mockDataBuilder';
import { setActiveLanguage } from '../support/helpers/i18n-helpers';

let server;

BeforeAll(() => {
  server = createServer();
});

AfterAll(() => {
  server.close();
});

After(async function () {
  await this.driver.quit();
});

Given(/^I am testing "([^"]*)"$/, feature => {
  buildMockData(feature);
});

Given(/^I have completed the basic setup$/, async function () {
  await this.waitForElement('.LanguageSelectionForm_submitButton');
  // Default Profile Configs
  await setActiveLanguage(this.driver);
  await this.driver.executeScript(() => { 
    window.icarus.actions.profile.acceptTermsOfUse.trigger();
  });
});

Given(/^I have opened the chrome extension$/, async function () {
  // Extension id is determinisitically calculated based on pubKey used to generate the crx file
  // so we can just hardcode this value if we keep e2etest-key.pem file
  // https://stackoverflow.com/a/10089780/3329806
  await this.driver.get('chrome-extension://bdlknlffjjmjckcldekkbejaogpkjphg/main_window.html');
});

Given(/^There is no wallet stored$/, async function () {
  await this.waitForElement('.WalletAddDialog');
});

Given(/^There is a default wallet stored$/, async function () {
  buildMockData('default');
  await storeWallet(this);
});

Given(/^There is a wallet stored( with ([^"]*) addresses)?( with the name ([^"]*))?$/,
  async function (totalAddresses, walletName) {
    await storeWallet(this, totalAddresses, walletName);
  });

async function storeWallet(client, totalAddresses, walletName) {
  const { seed, wallet, cryptoAccount, addresses, wallets } = getMockData();
  client.saveToLocalStorage('SEED', seed);
  client.saveToLocalStorage('WALLET', wallet);
  client.saveToLocalStorage('ACCOUNT', cryptoAccount);
  /* Obs: If "with $number addresses" is include in the sentence,
     we override the wallet with fake addresses" */
  if (totalAddresses) {
    const addressesStartingWith = walletName ?
      wallets[walletName].addressesStartingWith : walletName;
    client.saveToLocalStorage('ADDRESSES', getFakeAddresses(totalAddresses, addressesStartingWith));
  } else {
    client.saveToLocalStorage('ADDRESSES', addresses);
  }
  client.driver.executeScript(() => {
    window.icarus.stores.ada.wallets.refreshWalletsData();
  });
  await client.waitForElement('.TopBar_walletName');
}
