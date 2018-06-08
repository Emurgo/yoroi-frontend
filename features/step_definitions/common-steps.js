import { Before, Given, After } from 'cucumber';
import { createServer } from '../support/mockServer';

let server;

Before(() => {
  server = createServer();
});

After(async function () {
  await this.driver.quit();
  server.close();
});

Given(/^I have opened the chrome extension$/, async function () {
  await this.driver.get('chrome-extension://bflmcienanhdibafopagdcaaenkmoago/main_window.html');
});

Given(/^There is no wallet stored$/, async function () {
  await this.waitForElement('.WalletAddDialog');
});
