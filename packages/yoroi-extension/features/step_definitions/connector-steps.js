// @flow
import { By } from 'selenium-webdriver';
import {
  Given,
  Then,
} from 'cucumber';
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { Ports } from '../../scripts/connections';

let extensionWindowHandle;
let dappWindowHandle;
let popupWindowHandle;

//fixme: remove
Given(/^noop$/, function () {
  return new Promise(()=>{});
});

Then(/^I open the mock dApp$/, async function () {
  const oldHandles = await this.driver.getAllWindowHandles();
  if (oldHandles.length !== 1) {
    throw new Error('expect only the extension window handle');
  }
  extensionWindowHandle = oldHandles[0];

  await this.driver.switchTo().newWindow('tab');
  await this.driver.get(`http://localhost:${Ports.DevBackendServe}/mock-dapp`);

  const newHandles = (
    await this.driver.getAllWindowHandles()
  ).filter(handle => !oldHandles.includes(handle));
  if (newHandles.length !== 1) {
    throw new Error('expect 1 new window handle after opening the dApp');
  }
  dappWindowHandle = newHandles[0];
});

Then(/^I request access to Yoroi$/, async function () {
  await this.driver.executeScript('window.accessRequestPromise = cardano.yoroi.enable()');
});

Then(/^I should see the connector popup$/, async function () {
  // find and switch to the popup window
  const oldWindowHandles = [extensionWindowHandle, dappWindowHandle]
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

Then(/^I select the only wallet named (.+) with ([0-9\.]+) balance$/, async function (walletName, expectedBalance) {
  const walletList = await this.waitForElement({
    locator: '.ConnectPage_list',
    method: 'css'
  });
  const wallets = await walletList.findElements(By.css('li'));
  if (wallets.length !== 1) {
    throw new Error('expect 1 wallet but get ' + wallets.length);
  }
  const name = await (
    await wallets[0].findElement(By.css('div.WalletCard_name'))
  ).getText();
  if (name !== walletName) {
    throw new Error(`expect wallet name ${walletName} but get wallet name ${name}`);
  }
  await (
    await wallets[0].findElement(By.css('input[type="checkbox"]'))
  ).click();
  const balance = await (
    await wallets[0].findElement(By.css('.WalletCard_balance'))
  ).getText();
  const match = balance.match(/^[0-9\.]+/);
  if (!match) {
    throw new Error('can not get wallet balance');
  }
  if (match[0] !== expectedBalance) {
    throw new Error(`expect wallet balance ${expectedBalance} but get ${match[0]}`);
  }

  await (
    await this.getElementBy({
      locator: '//Button[text()="Connect"]',
      method: 'xpath',
    })
  ).click();
});

Then(/^The popup window should be closed$/, async function () {
  for (;;) {
    const windowHandles = await this.driver.getAllWindowHandles();
    if (windowHandles.length !== 2) {
      await new Promise(resolve => setTimeout(resolve, 100));
      continue;
    }
    if (!(
      (windowHandles[0] === extensionWindowHandle && windowHandles[1] === dappWindowHandle) ||
        (windowHandles[0] === dappWindowHandle && windowHandles[1] === extensionWindowHanle)
    )) {
      throw new ('expect only the extension window and the dApp window to be open');
    }
    break;
  }
  await this.driver.switchTo().window(dappWindowHandle);
});

Then(/^The access request should succeed$/, async function () {
  const ret = await this.driver.executeAsyncScript(function () {
    const callback = arguments[arguments.length - 1];
    window.accessRequestPromise.then(api => {
      window.api = api;
      callback({ success: true });
    }).catch(error => {
      callback({ success: false, errMsg: error.message });
    });
  });

  if (!ret.success) {
    throw new Error(`request access failed: ${ret.errMsg}`);
  }
});

Then(/^The dApp should see balance (\d+)$/, async function (expectedBalance) {
  const balanceCborHex = await this.driver.executeAsyncScript(function () {
    const callback = arguments[arguments.length - 1];
    window.api.getBalance().then(balance => {
      callback(balance);
    });
  });
  const value = RustModule.WalletV4.Value.from_bytes(
    Buffer.from(balanceCborHex, 'hex')
  );
  const balance = value.coin().to_str();
  if (balance !== String(expectedBalance)) {
    throw new Error(`expect balance ${expectedBalance} get balance ${balance}`);
  }
});
