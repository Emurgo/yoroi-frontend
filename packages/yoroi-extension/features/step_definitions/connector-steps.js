// @flow
import { Given, Then, When } from 'cucumber';
import { expect } from 'chai';
import { Ports } from '../../scripts/connections';
import {
  backButton,
  confirmButton,
  createWalletBtn,
  getWalletBalance,
  getWalletName,
  getWallets,
  logoElement,
  noWalletsImg,
  selectWallet,
  spendingPasswordErrorField,
  spendingPasswordInput,
} from '../pages/connector-connectWalletPage';
import { disconnectWallet, getWalletsWithConnectedWebsites } from '../pages/connectedWebsitesPage';
import {
  getTransactionFee,
  overviewTabButton,
  getTransactionAmount,
  utxoAddressesTabButton,
  getUTXOAddresses,
  transactionFeeTitle,
  cancelButton,
  transactionTotalAmountField,
} from '../pages/connector-signingTxPage';
import { getSigningData, signMessageTitle } from '../pages/connector-signingDataPage';
import { addCollateralTitle } from '../pages/connector-getCollateralPage';
import { mockDAppName, extensionTabName, popupConnectorName } from '../support/windowManager';

const userRejectMsg = 'user reject';
const userRejectSigningMsg = 'User rejected';
const mockDAppUrl = `http://localhost:${Ports.DevBackendServe}/mock-dapp`;

const connectorPopUpIsDisplayed = async (customWorld: Object) => {
  await customWorld.driver.sleep(2000);
  await customWorld.windowManager.findNewWindowAndSwitchTo(popupConnectorName);
  const windowTitle = await customWorld.driver.getTitle();
  expect(windowTitle).to.equal('Yoroi dApp Connector');
};

Given(/^I have opened the mock dApp$/, async function () {
  this.webDriverLogger.info(`Step: I have opened the mock dApp`);
  await this.driver.get(mockDAppUrl);
});

Then(/^I open the mock dApp tab$/, async function () {
  this.webDriverLogger.info(`Step: I open the mock dApp tab`);
  await this.windowManager.openNewTab(mockDAppName, mockDAppUrl);
});

Given(/^I switch back to the mock dApp$/, async function () {
  this.webDriverLogger.info(`Step: I switch back to the mock dApp`);
  await this.windowManager.switchTo(mockDAppName);
});

When(/^I refresh the dApp page$/, async function () {
  this.webDriverLogger.info(`Step: I refresh the dApp page`);
  await this.windowManager.switchTo(mockDAppName);
  await this.driver.executeScript('location.reload(true);');
  // wait for page to refresh
  await this.driver.sleep(500);
});

Then(/^I request anonymous access to Yoroi$/, async function () {
  this.webDriverLogger.info(`Step: I request anonymous access to Yoroi`);
  await this.mockDAppPage.requestNonAuthAccess();
});

Then(/^I request access to Yoroi$/, async function () {
  this.webDriverLogger.info(`Step: I request access to Yoroi`);
  await this.mockDAppPage.requestAuthAccess();
});

Then(/^I should see the connector popup for connection$/, async function () {
  this.webDriverLogger.info(`Step: I should see the connector popup for connection`);
  await connectorPopUpIsDisplayed(this);
  await this.waitForElement(logoElement);
});

Then(/^I should see the connector popup for signing$/, async function () {
  this.webDriverLogger.info(`Step: I should see the connector popup for signing`);
  await connectorPopUpIsDisplayed(this);
  await this.waitForElement(transactionTotalAmountField);
});

Then(/^I should see the connector popup for signing data$/, async function () {
  this.webDriverLogger.info(`Step: I should see the connector popup for signing data`);
  await connectorPopUpIsDisplayed(this);
  await this.waitForElement(signMessageTitle);
});

Then(/^There is no the connector popup$/, async function () {
  this.webDriverLogger.info(`Step: There is no the connector popup`);
  const newWindows = await this.windowManager.findNewWindows();
  expect(newWindows.length).to.equal(0, 'A new window is displayed');
});

Then(
  /^I select the only wallet named (.+) with ([0-9.]+) balance$/,
  async function (walletName, expectedBalance) {
    this.webDriverLogger.info(
      `Step: I select the only wallet named ${walletName} with ${expectedBalance} balance`
    );
    const wallets = await getWallets(this);
    expect(wallets.length).to.equal(1, `expect 1 wallet but get ${wallets.length}`);
    const name = await getWalletName(wallets, 0);
    expect(name).to.equal(
      walletName,
      `expect wallet name ${walletName} but get wallet name ${name}`
    );
    const balance = await getWalletBalance(wallets, 0);
    const match = balance.match(/^[0-9.]+/);
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
  this.webDriverLogger.info(
    `Step: I enter the spending password ${spendingPassword} and click confirm`
  );
  await this.waitForElement(spendingPasswordInput);
  const text = await this.getValue(spendingPasswordInput);
  await this.clearInputUpdatingForm(spendingPasswordInput, text.length);
  await this.input(spendingPasswordInput, spendingPassword);
  await this.click(confirmButton);
});

Then(/^The popup window should be closed$/, async function () {
  this.webDriverLogger.info(`Step: The popup window should be closed`);
  const result = await this.windowManager.isClosed(popupConnectorName);
  expect(result, 'The window|tab is still opened').to.be.true;
  await this.windowManager.switchTo(mockDAppName);
});

Then(/^The access request should succeed$/, async function () {
  this.webDriverLogger.info(`Step: The access request should succeed`);
  const requestAccessResult = await this.mockDAppPage.checkAccessRequest();
  expect(
    requestAccessResult.success,
    `Request access failed: ${requestAccessResult.errMsg}`
  ).to.be.true;
  await this.mockDAppPage.addOnDisconnect();
});

Then(/^The user reject is received$/, async function () {
  this.webDriverLogger.info(`Step: The user reject is received`);
  const requestAccessResult = await this.mockDAppPage.checkAccessRequest();
  expect(requestAccessResult.success, `Request access is granted`).to.be.false;
  expect(requestAccessResult.errMsg).to.equal(userRejectMsg, 'Wrong error message');
});

Then(/^The dApp should see balance (\d+)$/, async function (expectedBalance) {
  this.webDriverLogger.info(`Step: The dApp should see balance ${expectedBalance}`);
  const balance = await this.mockDAppPage.getBalance();
  expect(balance).to.equal(
    String(expectedBalance),
    `expect balance ${expectedBalance} get balance ${balance}`
  );
});

When(/^I request signing the transaction:$/, async function (table) {
  const fields = table.hashes()[0];
  const normalizedAmount = `${parseFloat(fields.amount) * parseFloat('1000000')}`;
  this.webDriverLogger.info(
    `Step: I request signing the transaction: ${normalizedAmount} to address: ${fields.address}`
  );
  await this.mockDAppPage.requestSigningTx(normalizedAmount, fields.toAddress);
});

Then(/^I should see the transaction amount data:$/, async function (table) {
  await this.waitForElement(overviewTabButton);
  const fields = table.hashes()[0];
  const realFee = await getTransactionFee(this);
  const expectedFee = `-${fields.fee}`;
  const realFullAmount = await getTransactionAmount(this);
  const expectedTotalAmount = `-${parseFloat(fields.amount) + parseFloat(fields.fee)}`;
  this.webDriverLogger.info(
    `Step: I should see the transaction amount data: amount: ${expectedTotalAmount}, fee: ${expectedFee} `
  );
  expect(realFee, 'Fee is different').to.equal(expectedFee);
  expect(realFullAmount, 'Total amount is different').to.equal(expectedTotalAmount);
});

Then(/^I should see the transaction addresses info:$/, async function (table) {
  await this.waitForElement(overviewTabButton);
  const tableHashes = table.hashes();
  const fields = tableHashes[0];

  this.webDriverLogger.info(
    `Step: I should see the transaction addresses info: from: ${fields.fromAddress}, to: ${fields.toAddress} `
  );

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
  this.webDriverLogger.info(`Step: The signing transaction API should return ${txHex} `);
  const result = await this.mockDAppPage.getSigningTxResult();
  expect(result).to.equal(txHex);
});

Then(/^I see the error Incorrect wallet password$/, async function () {
  this.webDriverLogger.info(`Step: I see the error Incorrect wallet password`);
  await this.waitForElement(spendingPasswordErrorField);
  expect(
    await this.isDisplayed(spendingPasswordErrorField),
    "The error isn't displayed"
  ).to.be.true;
  const errorText = await this.getText(spendingPasswordErrorField);
  expect(errorText).to.equal('Incorrect spending password. Please retype.');
});

Then(/^I should see no password errors$/, async function () {
  this.webDriverLogger.info(`Step: I should see no password errors`);
  expect(await this.isDisplayed(spendingPasswordErrorField), 'The error is displayed').to.be.false;
});

When(/^I click the back button \(Connector pop-up window\)$/, async function () {
  this.webDriverLogger.info(`Step: I click the back button \(Connector pop-up window\)`);
  await this.waitForElement(backButton);
  await this.click(backButton);
});

Then(/^I should see the wallet's list$/, async function () {
  this.webDriverLogger.info(`Step: I should see the wallet's list`);
  const wallets = await getWallets(this);
  expect(wallets.length, 'There are no wallets').to.not.equal(0);
});

Then(/^I close the dApp-connector pop-up window$/, async function () {
  this.webDriverLogger.info(`Step: I close the dApp-connector pop-up window`);
  await this.windowManager.closeTabWindow(popupConnectorName, mockDAppName);
});

Then(/^The wallet (.+) is connected to the website (.+)$/, async function (walletName, websiteUrl) {
  this.webDriverLogger.info(`Step: The wallet ${walletName} is connected to the website ${websiteUrl}`);
  await this.windowManager.switchTo(extensionTabName);
  const connectedWebsitesAddress = `${this.getExtensionUrl()}#/connector/connected-websites`;
  // it should be reworked by using ui components when it is done
  await this.driver.get(connectedWebsitesAddress);
  const wallets = await getWalletsWithConnectedWebsites(this);
  const result = wallets.filter(
    wallet => wallet.walletTitle === walletName && wallet.websiteTitle === websiteUrl
  );
  expect(result.length, `Result is not equal to 1:\n${JSON.stringify(result)}`).to.equal(1);
  await this.windowManager.switchTo(mockDAppName);
});

Then(/^I disconnect the wallet (.+) from the dApp (.+)$/, async function (walletName, dAppUrl) {
  this.webDriverLogger.info(`Step: I disconnect the wallet ${walletName} from the dApp ${dAppUrl}`);
  await this.windowManager.switchTo(extensionTabName);
  const connectedWebsitesAddress = `${this.getExtensionUrl()}#/connector/connected-websites`;
  // it should be reworked by using ui components when it is done
  await this.driver.get(connectedWebsitesAddress);
  await disconnectWallet(this, walletName, dAppUrl);
});

Then(/^I receive the wallet disconnection message$/, async function () {
  this.webDriverLogger.info(`Step: I receive the wallet disconnection message`);
  await this.windowManager.switchTo(mockDAppName);
  const isEnabledState = await this.mockDAppPage.isEnabled();
  expect(isEnabledState, 'The wallet is still enabled').to.be.false;
  const connectionState = await this.mockDAppPage.getConnectionState();
  expect(connectionState, 'No message from the dApp-connector is received').to.be.false;
});

Then(/^The user reject for signing is received$/, async function () {
  this.webDriverLogger.info(`Step: The user reject for signing is received`);
  await this.windowManager.switchTo(mockDAppName);
  const signingResult = await this.mockDAppPage.getSigningTxResult();
  expect(signingResult.code, `The reject signing code is different`).to.equal(2);
  expect(signingResult.info).to.equal(userRejectSigningMsg, 'Wrong error message');
});

Then(/^I should see "No Cardano wallets is found" message$/, async function () {
  this.webDriverLogger.info(`Step: I should see "No Cardano wallets is found" message`);
  await this.waitForElement(noWalletsImg);
  const state = await this.isDisplayed(noWalletsImg);
  expect(state, 'There is no "Ooops, no Cardano wallets found" message').to.be.true;
});

Then(/^I press the "Create wallet" button \(Connector pop-up window\)$/, async function () {
  this.webDriverLogger.info(`Step: I press the "Create wallet" button \(Connector pop-up window\)`);
  await this.waitForElement(createWalletBtn);
  await this.click(createWalletBtn);
});

Then(/^The pop-up is closed and the extension tab is opened$/, async function () {
  this.webDriverLogger.info(`Step: The pop-up is closed and the extension tab is opened`);
  const result = await this.windowManager.isClosed(popupConnectorName);
  expect(result, 'The window|tab is still opened').to.be.true;

  await this.windowManager.findNewWindowAndSwitchTo(extensionTabName);
  const windowTitle = await this.driver.getTitle();
  expect(windowTitle).to.equal(extensionTabName);
});

Then(/^I cancel signing the transaction$/, async function () {
  this.webDriverLogger.info(`Step: I cancel signing the transaction`);
  await this.click(cancelButton);
});

When(/^I request signing the data:$/, async function (table) {
  const tableHashes = table.hashes();
  const fields = tableHashes[0];
  const payload = fields.payload;
  this.webDriverLogger.info(`Step: I request signing the data: ${payload}`);
  await this.mockDAppPage.requestSigningData(payload);
});

Then(/^I should see the data to sign:$/, async function (table) {
  const tableHashes = table.hashes();
  const fields = tableHashes[0];
  const payload = fields.payload;
  const actualSigningData = await getSigningData(this);
  this.webDriverLogger.info(`Step: I should see the data to sign: ${payload}`);
  expect(actualSigningData, 'Signing Data is different').to.equal(payload);
});

Then(/^The signing data API should return (.+)$/, async function (dataHex) {
  this.webDriverLogger.info(`Step: The signing data API should return ${dataHex}`);
  const result = await this.mockDAppPage.getSigningDataResult();
  expect(result).to.equal(dataHex);
});

Then(/^The user reject for signing data is received$/, async function () {
  this.webDriverLogger.info(`Step: The user reject for signing data is received`);
  await this.windowManager.switchTo(mockDAppName);
  const signingResult = await this.mockDAppPage.getSigningDataResult();
  expect(signingResult.code, `The reject signing code is different`).to.equal(2);
  expect(signingResult.info).to.equal(userRejectSigningMsg, 'Wrong error message');
});

When(/^I ask to get Collateral for (.+) Utxos$/, async function (utxos) {
  this.webDriverLogger.info(`Step: I ask to get Collateral for ${utxos} Utxos`);
  await this.mockDAppPage.addCollateral(utxos);
});

Then(
  /^The dApp should see collateral: (.+) for (.+)$/,
  async function (expectedCollateral, utxosAmount) {
    this.webDriverLogger.info(`Step: The dApp should see collateral: ${expectedCollateral} for ${utxosAmount}`);
    const collateral = await this.mockDAppPage.getCollateralUtxos(utxosAmount);
    const collateralJson = JSON.parse(collateral)[0];
    const expectedUtxos = JSON.parse(expectedCollateral);
    expect(collateralJson, 'Collateral is different to expected').to.be.deep.equal(expectedUtxos);
  }
);

Then(/^I should see the connector popup to Add Collateral$/, async function () {
  this.webDriverLogger.info(`Step: I should see the connector popup to Add Collateral`);
  await connectorPopUpIsDisplayed(this);
  await this.waitForElement(addCollateralTitle);
});

Then(/^I should see the collateral fee data:$/, async function (table) {
  await this.waitForElement(overviewTabButton);
  const fields = table.hashes()[0];
  const realFee = await getTransactionFee(this);
  const expectedFee = `-${fields.fee}`;
  const realFullAmount = await getTransactionAmount(this);
  this.webDriverLogger.info(`Step: I should see the collateral fee data: ${expectedFee}`);
  expect(realFee, 'Fee is different').to.equal(expectedFee);
  expect(realFullAmount, 'Total amount is different').to.equal(expectedFee);
});

Then(/^I should see the collateral from address info:$/, async function (table) {
  await this.waitForElement(overviewTabButton);
  const tableHashes = table.hashes();
  const fields = tableHashes[0];
  await this.click(utxoAddressesTabButton);

  const expectedFromAddress = fields.fromAddress;
  const expectedFromAddressAmount = fields.fromAddressAmount;

  const actualAddresses = await getUTXOAddresses(this);
  const actualFromAddresses = actualAddresses.fromAddresses;
  const foundFromAddresses = actualFromAddresses.filter(
    addr =>
      addr.address === expectedFromAddress && addr.amount === parseFloat(expectedFromAddressAmount)
  );
  this.webDriverLogger.info(`Step: I should see the collateral from address info: address: ${expectedFromAddress}, amount: ${expectedFromAddressAmount}`);
  expect(
    foundFromAddresses.length,
    `Expected fromAddress:
  address:${expectedFromAddress}, amount: ${expectedFromAddressAmount}
  Received:\n${JSON.stringify(actualFromAddresses)}`
  ).to.equal(1);
});

Then(/^I should see the collateral to addresses info:$/, async function (table) {
  this.webDriverLogger.info(`Step: I should see the collateral to addresses info`);
  await this.waitForElement(overviewTabButton);
  const tableHashes = table.hashes();
  await this.click(utxoAddressesTabButton);

  const actualAddresses = await getUTXOAddresses(this);
  const actualToAddresses = actualAddresses.toAddresses;
  actualToAddresses.forEach((addr, index) => {
    expect(addr.address).to.equal(tableHashes[index].toAddresses);
    expect(addr.amount).to.equal(parseFloat(tableHashes[index].toAddressesAmount));
  });
  await this.click(overviewTabButton);
  await this.waitForElement(transactionFeeTitle);
});

When(/^I request unused addresses$/, async function () {
  this.webDriverLogger.info(`Step: I request unused addresses`);
  await this.mockDAppPage.requestUnusedAddresses();
});

When(/^I request used addresses$/, async function () {
  this.webDriverLogger.info(`Step: I request used addresses`);
  await this.mockDAppPage.requestUsedAddresses();
});
