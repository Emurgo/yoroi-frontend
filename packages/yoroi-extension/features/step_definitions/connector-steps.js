// @flow
import { Then } from 'cucumber';
// eslint-disable-next-line import/named
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { expect } from 'chai';
import { Ports } from '../../scripts/connections';
import {
  confirmButton,
  getWalletBalance,
  getWalletName,
  getWallets,
  selectWallet,
  spendingPasswordField,
} from '../pages/connector-connectWalletPage';

let extensionWindowHandle;
let dappWindowHandle;
let popupWindowHandle;

Then(/^I open the mock dApp$/, async function () {
  const oldHandles = await this.driver.getAllWindowHandles();
  expect(oldHandles.length).to.equal(1, 'Expect only the extension window handle');
  extensionWindowHandle = oldHandles[0];

  await this.driver.switchTo().newWindow('tab');
  await this.driver.get(`http://localhost:${Ports.DevBackendServe}/mock-dapp`);

  const newHandles = (await this.driver.getAllWindowHandles()).filter(
    handle => !oldHandles.includes(handle)
  );
  expect(newHandles.length).to.equal(1, 'Expect 1 new window handle after opening the dApp');
  dappWindowHandle = newHandles[0];
});

Then(/^I request anonymous access to Yoroi$/, async function () {
  await this.driver.executeScript('window.accessRequestPromise = cardano.yoroi.enable()');
});

Then(/^I request access to Yoroi$/, async function () {
  await this.driver.executeScript(
    'window.accessRequestPromise = cardano.yoroi.enable({requestIdentification: true})'
  );
});

Then(/^I should see the connector popup$/, async function () {
  // find and switch to the popup window
  const oldWindowHandles = [extensionWindowHandle, dappWindowHandle];
  let newWindowHandles;
  for (;;) {
    await new Promise(resolve => setTimeout(resolve, 100));
    newWindowHandles = await this.driver.getAllWindowHandles();
    if (newWindowHandles.length > oldWindowHandles.length) {
      break;
    }
  }
  const popupWindowHandleArr = newWindowHandles.filter(
    handle => !oldWindowHandles.includes(handle)
  );
  if (popupWindowHandleArr.length !== 1) {
    throw new Error('Can not find the popup window');
  }
  popupWindowHandle = popupWindowHandleArr[0];
  await this.driver.switchTo().window(popupWindowHandle);
});

Then(
  /^I select the only wallet named (.+) with ([0-9\.]+) balance$/,
  async function (walletName, expectedBalance) {
    const wallets = await getWallets(this);
    expect(wallets.length).to.equal(1, `expect 1 wallet but get ${wallets.length}`);
    const name = await getWalletName(wallets, 0);
    expect(name).to.equal(
      walletName,
      `expect wallet name ${walletName} but get wallet name ${name}`
    );
    const balance = await getWalletBalance(wallets, 0);
    const match = balance.match(/^[0-9\.]+/);
    expect(match, 'Can not get wallet balance').to.not.be.null;
    expect(match[0]).to.equal(
      expectedBalance,
      `expect wallet balance ${expectedBalance} but get ${match[0]}`
    );
    await selectWallet(wallets, 0);
    await this.driver.sleep(1000);
  }
);

Then(/^I enter the spending password (.+) and click confirm$/, async function (spendingPassword) {
  await this.waitForElement(spendingPasswordField);
  await this.input(spendingPasswordField, spendingPassword);
  await this.click(confirmButton);
});

Then(/^The popup window should be closed$/, async function () {
  for (;;) {
    const windowHandles = await this.driver.getAllWindowHandles();
    if (windowHandles.length !== 2) {
      await new Promise(resolve => setTimeout(resolve, 100));
      continue;
    }
    if (
      !(
        (windowHandles[0] === extensionWindowHandle && windowHandles[1] === dappWindowHandle) ||
        (windowHandles[0] === dappWindowHandle && windowHandles[1] === extensionWindowHandle)
      )
    ) {
      throw new Error('Expected only the extension window and the dApp window to be open');
    }
    break;
  }
  await this.driver.switchTo().window(dappWindowHandle);
});

Then(/^The access request should succeed$/, async function () {
  const ret = await this.driver.executeAsyncScript((...args) => {
    const callback = args[args.length - 1];
    window.accessRequestPromise
      // eslint-disable-next-line promise/always-return
      .then(api => {
        window.api = api;
        callback({ success: true });
      })
      .catch(error => {
        callback({ success: false, errMsg: error.message });
      });
  });

  if (!ret.success) {
    throw new Error(`request access failed: ${ret.errMsg}`);
  }
});

Then(/^The dApp should see balance (\d+)$/, async function (expectedBalance) {
  const balanceCborHex = await this.driver.executeAsyncScript((...args) => {
    const callback = args[args.length - 1];
    window.api.getBalance()
      // eslint-disable-next-line promise/always-return
      .then(balance => {
        callback(balance);
      })
      .catch(error => {
        throw new Error(JSON.stringify(error));
      });
  });
  const value = RustModule.WalletV4.Value.from_bytes(Buffer.from(balanceCborHex, 'hex'));
  const balance = value.coin().to_str();
  if (balance !== String(expectedBalance)) {
    throw new Error(`expect balance ${expectedBalance} get balance ${balance}`);
  }
});
