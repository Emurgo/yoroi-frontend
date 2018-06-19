import { BeforeAll, Given, After, AfterAll } from 'cucumber';
import { createServer } from '../support/mockServer';
import { buildMockData, getMockData, getFakeAddresses } from '../support/mockDataBuilder';

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

Given(/^There is a wallet stored( with ([^"]*) addresses)?( starting with ([^"]*))?$/,
  async function (addressAmount, addressPrefix) {
    const { seed, wallet, cryptoAccount, addresses } = getMockData();
    this.saveToLocalStorage('SEED', seed);
    this.saveToLocalStorage('WALLET', wallet);
    this.saveToLocalStorage('ACCOUNT', cryptoAccount);
    /* Obs: If "with $number addresses" is include in the sentence,
      we overide the wallet with fake addresses" */
    if (addressAmount) {
      this.saveToLocalStorage('ADDRESSES', getFakeAddresses(addressAmount, addressPrefix));
    } else {
      this.saveToLocalStorage('ADDRESSES', addresses);
    }
    await this.waitForElement('.TopBar_walletName');
  });
