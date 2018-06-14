import { BeforeAll, Given, After, AfterAll } from 'cucumber';
import { createServer } from '../support/mockServer';
import { buildMockData, getMockData, getAddresses } from '../support/mockDataBuilder';

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

Given(/^I have opened the chrome extension$/, async function () {
  await this.driver.get('chrome-extension://bflmcienanhdibafopagdcaaenkmoago/main_window.html');
});

Given(/^There is no wallet stored$/, async function () {
  await this.waitForElement('.WalletAddDialog');
});

Given(/^There is a wallet stored( with ([^"]*) addresses)?$/, async function (addressAmount) {
  const { seed, cryptoAccount, wallet } = getMockData();
  const addresses = getAddresses(addressAmount);
  this.saveToLocalStorage('ADDRESSES', addresses);
  this.saveToLocalStorage('ACCOUNT', cryptoAccount);
  this.saveToLocalStorage('SEED', seed);
  this.saveToLocalStorage('WALLET', wallet);
  await this.waitForElement('.TopBar_walletName');
});
