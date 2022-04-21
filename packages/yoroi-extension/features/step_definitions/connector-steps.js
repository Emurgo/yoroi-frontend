// @flow
import { Then, When } from 'cucumber';
import { expect } from 'chai';
import { Ports } from '../../scripts/connections';
import {
  backButton,
  confirmButton,
  getWalletBalance,
  getWalletName,
  getWallets,
  selectWallet,
  spendingPasswordErrorField,
  spendingPasswordInput,
} from '../pages/connector-connectWalletPage';
import { disconnectWallet } from '../pages/connectedWebsitesPage';
import {
  getTransactionFee,
  overviewTabButton,
  getTransactionAmount,
  utxoAddressesTabButton,
  getUTXOAddresses,
  transactionFeeTitle,
} from '../pages/connector-signingTxPage';

const mockDAppName = 'mockDAppTab';
const popupConnectorName = 'popupConnectorWindow';
const userRejectMsg = 'user reject';
const extensionTabName = 'main';

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
  const windowTitle = await this.driver.getTitle();
  expect(windowTitle).to.equal('Yoroi dApp Connector');
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
  await this.waitForElement(spendingPasswordInput);
  const text = await this.getValue(spendingPasswordInput);
  await this.clearInputUpdatingForm(spendingPasswordInput, text.length);
  await this.input(spendingPasswordInput, spendingPassword);
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
  await this.mockDAppPage.addOnDisconnect();
});

Then(/^The user reject is received$/, async function () {
  const requestAccessResult = await this.mockDAppPage.checkAccessRequest();
  expect(requestAccessResult.success, `Request access is granted`).to.be.false;
  expect(requestAccessResult.errMsg).to.equal(userRejectMsg, 'Wrong error message');
});

Then(/^The dApp should see balance (\d+)$/, async function (expectedBalance) {
  const balance = await this.mockDAppPage.getBalance();
  expect(balance).to.equal(
    String(expectedBalance),
    `expect balance ${expectedBalance} get balance ${balance}`
  );
});

When(/^I request signing the transaction:$/, async function (table) {
  const fields = table.hashes()[0];
  const normalizedAmount = `${parseFloat(fields.amount) * parseFloat('1000000')}`;
  await this.mockDAppPage.requestSigningTx(normalizedAmount, fields.toAddress);
});

Then(/^I should see the transaction amount data:$/, async function (table) {
  await this.waitForElement(overviewTabButton);
  const fields = table.hashes()[0];
  const realFee = await getTransactionFee(this);
  const expectedFee = `-${fields.fee}`;
  const realFullAmount = await getTransactionAmount(this);
  const expectedTotalAmount = `-${parseFloat(fields.amount) + parseFloat(fields.fee)}`;
  expect(realFee, 'Fee is different').to.equal(expectedFee);
  expect(realFullAmount, 'Total amount is different').to.equal(expectedTotalAmount);
});

Then(/^I should see the transaction addresses info:$/, async function (table) {
  await this.waitForElement(overviewTabButton);
  const tableHashes = table.hashes();
  const fields = tableHashes[0];
  await this.click(utxoAddressesTabButton);

  const expectedFromAddress = fields.fromAddress;
  const expectedFromAddressAmount = fields.fromAddressAmount;
  const expectedToAddress = fields.toAddress;
  const expectedToAddressAmount = fields.toAddressAmount;

  const realAddresses = await getUTXOAddresses(this);
  const realFromAddresses = realAddresses.fromAddresses;
  const foundFromAddresses = realFromAddresses.filter(
    addr =>
      addr.address === expectedFromAddress && addr.amount === parseFloat(expectedFromAddressAmount)
  );
  expect(
    foundFromAddresses.length,
    `Expected fromAddress:
  address:${expectedFromAddress}, amount: ${expectedFromAddressAmount}
  Received:\n${JSON.stringify(realFromAddresses)}`
  ).to.equal(1);

  const realToAddresses = realAddresses.toAddresses;
  const foundToAddresses = realToAddresses.filter(
    addr =>
      addr.address === expectedToAddress && addr.amount === parseFloat(expectedToAddressAmount)
  );
  expect(
    foundToAddresses.length,
    `Expected toAddress:
  address: ${expectedFromAddress}, amount: ${expectedFromAddressAmount}
  Received:\n${JSON.stringify(realFromAddresses)}`
  ).to.equal(1);
  await this.click(overviewTabButton);
  await this.waitForElement(transactionFeeTitle);
});

Then(/^The signing transaction API should return (.+)$/, async function (txHex) {
  const result = await this.mockDAppPage.getSigningTxResult();
  expect(result).to.equal(txHex);
});

Then(/^I see the error Incorrect wallet password$/, async function () {
  await this.waitForElement(spendingPasswordErrorField);
  expect(await this.isDisplayed(spendingPasswordErrorField), "The error isn't displayed").to.be.true;
  const errorText = await this.getText(spendingPasswordErrorField);
  expect(errorText).to.equal('Incorrect wallet password.');
});

Then(/^I should see no password errors$/, async function () {
  expect(await this.isDisplayed(spendingPasswordErrorField), 'The error is displayed').to.be.false;
});

When(/^I click the back button \(Connector pop-up window\)$/, async function () {
  await this.waitForElement(backButton);
  await this.click(backButton);
});

Then(/^I should see the wallet's list$/, async function () {
  const wallets = await getWallets(this);
  expect(wallets.length, 'There are no wallets').to.not.equal(0);
});

Then(/^I close the dApp-connector pop-up window$/, async function () {
  await this.windowManager.closeTabWindow(popupConnectorName, mockDAppName);
});

Then(/^I disconnect the wallet (.+) from the dApp (.+)$/, async function (walletName, dAppUrl) {
  await this.windowManager.switchTo(extensionTabName);
  const connectedWebsitesAddress = `${this.getExtensionUrl()}#/connector/connected-websites`;
  // it should be reworked by using ui components when it is done
  await this.driver.get(connectedWebsitesAddress);
  await disconnectWallet(this, walletName, dAppUrl);
});

Then(/^I receive the wallet disconnection message$/, async function () {
  await this.windowManager.switchTo(mockDAppName);
  const connectionState = await this.mockDAppPage.getConnectionState();
  expect(connectionState, 'No message from the dApp-connector is received').to.be.false;
});