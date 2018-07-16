import { BeforeAll, Given, After, AfterAll } from 'cucumber';
import { createServer } from '../support/mockServer';
import { buildMockData, getMockData, getFakeAddresses } from '../support/mockDataBuilder';
import { setActiveLanguage } from '../support/helpers/i18n-helpers';

let server;

export function initializeServer(settings) {
  server = createServer(settings);
}

export function closeServer() {
  server.close();
}

BeforeAll(() => {
  initializeServer({});
});

AfterAll(() => {
  closeServer();
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
  await refreshWallet(this);
  await this.waitForElement('.WalletAdd');
});

Given(/^There is a default wallet stored$/, async function () {
  buildMockData('default');
  await storeWallet(this);
});

Given(/^There is a wallet stored( named ([^"]*))?$/, async function (walletName) {
  await storeWallet(this, walletName);
});

function refreshWallet(client) {
  return client.driver.executeAsyncScript((done) => { 
    window.icarus.stores.ada.wallets.refreshWalletsData().then(done).catch(err => done(err));
  });
}

async function storeWallet(client, walletName) {
  const { seed, wallet, cryptoAccount, addresses, walletInitialData } = getMockData();
  if (walletName) {
    wallet.cwMeta.cwName = walletName;
  }

  await client.saveToLocalStorage('WALLET', { adaWallet: wallet, seed });
  await client.saveToLocalStorage('ACCOUNT', cryptoAccount);

  /* Obs: If "with $number addresses" is include in the sentence,
     we override the wallet with fake addresses" */
  if (walletName &&
      walletInitialData &&
      walletInitialData[walletName] &&
      walletInitialData[walletName].totalAddresses
    ) {
    client.saveToLocalStorage('ADDRESSES', getFakeAddresses(
      walletInitialData[walletName].totalAddresses,
      walletInitialData[walletName].addressesStartingWith
    ));
  } else {
    client.saveToLocalStorage('ADDRESSES', addresses);
  }
  await refreshWallet(client);
  await client.waitForElement('.TopBar_walletName');
}
