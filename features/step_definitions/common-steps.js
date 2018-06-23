import { BeforeAll, Before, Given, After, AfterAll } from 'cucumber';
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

Before(async function () {
  await this.driver.get('chrome-extension://bflmcienanhdibafopagdcaaenkmoago/main_window.html');
});

After(async function () {
  await this.driver.quit();
});

Given(/^I am testing "([^"]*)"$/, feature => {
  buildMockData(feature);
});

Given(/^I have completed the basic setup$/, async function () {
  // Default Profile Configs
  await setActiveLanguage(this.driver);
  await this.driver.executeScript(() => { 
    window.icarus.actions.profile.acceptTermsOfUse.trigger();
  });
});

Given(/^There is no wallet stored$/, async function () {
  await this.waitForElement('.WalletAddDialog');
});

Given(/^There is a default wallet stored$/, async function () {
  buildMockData('default');
  await storeWallet(this);
});

Given(/^There is a wallet stored( with ([^"]*) addresses)?$/, async function (addressAmount) {
  await storeWallet(this, addressAmount);
});

async function storeWallet(driver, addressAmount) {
  const { seed, wallet, cryptoAccount, addresses } = getMockData();
  driver.saveToLocalStorage('SEED', seed);
  driver.saveToLocalStorage('WALLET', wallet);
  driver.saveToLocalStorage('ACCOUNT', cryptoAccount);
  /* Obs: If "with $number addresses" is include in the sentence,
     we override the wallet with fake addresses" */
  if (addressAmount) {
    driver.saveToLocalStorage('ADDRESSES', getFakeAddresses(addressAmount));
  } else {
    driver.saveToLocalStorage('ADDRESSES', addresses);
  }
  await driver.waitForElement('.TopBar_walletName');
}
