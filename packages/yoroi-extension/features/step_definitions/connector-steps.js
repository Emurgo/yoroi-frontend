// @flow
import { Then } from 'cucumber';
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

const mockDAppName = 'mockDAppTab';
const popupConnectorName = 'popupConnectorWindow';

Then(/^I open the mock dApp$/, async function () {
  await this.windowManager.openNewTab(
    mockDAppName,
    `http://localhost:${Ports.DevBackendServe}/mock-dapp`
  );
});

Then(/^I request anonymous access to Yoroi$/, async function () {
  await this.mockDAppPage.requestNonAuthAccess();
});

Then(/^I request access to Yoroi$/, async function () {
  await this.mockDAppPage.requestAuthAccess();
});

Then(/^I should see the connector popup$/, async function () {
  await this.windowManager.findNewWindowAndSwitchTo(popupConnectorName);
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
    // $FlowFixMe[incompatible-use]
    const balanceMatch = match[0];
    expect(balanceMatch).to.equal(
      expectedBalance,
      `expect wallet balance ${expectedBalance} but get ${balanceMatch}`
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
  const result = await this.windowManager.isClosed(popupConnectorName);
  expect(result, 'The window|tab is still opened').to.be.true;
  await this.windowManager.switchTo(mockDAppName);
});

Then(/^The access request should succeed$/, async function () {
  const requestAccessResult = await this.mockDAppPage.checkAccessRequest();
  expect(
    requestAccessResult.success,
    `Request access failed: ${requestAccessResult.errMsg}`
  ).to.be.true;
});

Then(/^The dApp should see balance (\d+)$/, async function (expectedBalance) {
  const balance = await this.mockDAppPage.getBalance();
  expect(balance).to.equal(
    String(expectedBalance),
    `expect balance ${expectedBalance} get balance ${balance}`
  );
});
