import { expect } from 'chai';
import DAppConnectWallet from '../../pages/dapp/dAppConnectWallet.page.js';
import { mockDAppName, popupConnectorName } from '../windowManager.js';
import {
  bytesToHex,
  getAddressFromBytes,
  getAddressFromBech32,
  getLargestFirstMultiAsset,
  getTransactionOutput,
  getTxBuilder,
  getCslUtxos,
} from './dAppTxHelper.js';

/**
 * The function to request non-authorised connection the a wallet.
 * Also several checks are in here.
 * @param {ThenableWebDriver} webdriver
 * @param {Logger} logger
 * @param {WindowManager} windowManager
 * @param {MockDAppWebpage} mockedDApp
 * @param {{name: string, plate: string, mnemonic: string}} testWalettObj
 * @param {boolean} checkBalance
 * @returns {Promise<void>}
 */
export const connectNonAuth = async (
  webdriver,
  logger,
  windowManager,
  mockedDApp,
  testWalettObj,
  checkBalance = true
) => {
  await mockedDApp.requestNonAuthAccess();
  const dappConnectPage = new DAppConnectWallet(webdriver, logger);
  // the window focus is switched to the pop-up here
  const popUpAppeared = await dappConnectPage.popUpIsDisplayed(windowManager);
  expect(popUpAppeared, 'The connector pop-up is not displayed').to.be.true;
  await dappConnectPage.waitingConnectorIsReady();
  const allWallets = await dappConnectPage.getWallets();
  expect(allWallets.length).to.equal(1);
  const walletInfo = await dappConnectPage.getWalletInfo(testWalettObj.plate);
  if (checkBalance) {
    expect(walletInfo.walletBalance, 'The wallet balance is different').to.equal(
      testWalettObj.balance
    );
  }
  expect(walletInfo.walletName, `The wallet name should be "${testWalettObj.name}"`).to.equal(
    testWalettObj.name
  );
  expect(walletInfo.walletPlate, `The wallet plate should be "${testWalettObj.plate}"`).to.equal(
    testWalettObj.plate
  );
  await dappConnectPage.selectWallet(testWalettObj.plate);
  const result = await windowManager.isClosed(popupConnectorName);
  expect(result, 'The window|tab is still opened').to.be.true;
  await windowManager.switchTo(mockDAppName);
  const requestAccessResult = await mockedDApp.checkAccessRequest();
  expect(requestAccessResult.success, `Request access failed: ${requestAccessResult.errMsg}`).to.be
    .true;
  await mockedDApp.addOnDisconnect();
};

/**
 * Creates a simple unsigned Tx
 * @param {string} receiverAddrBech32 - receiver address in Bech32 format
 * @param {string} amount - amount to send in lovelaces. Example: "2000000" (2 ADA)
 * @param {string} changeAddressHex - change address in HEX format
 * @param {Array<string>} utxosHex - UTxOs available in the wallet
 * @returns {{uTxHex: string, txFee: string}} Unsigned Tx in HEX format
 */
export const buildSimpleTx = (receiverAddrBech32, amount, changeAddressHex, utxosHex) => {
  const buildTransactionInput = { amount, address: receiverAddrBech32 };
  const txBuilder = getTxBuilder();
  const cslChangeAddress = getAddressFromBytes(changeAddressHex);
  const cslOutputAddress = getAddressFromBech32(receiverAddrBech32);
  const cslOutput = getTransactionOutput(cslOutputAddress, buildTransactionInput);
  txBuilder.add_output(cslOutput);
  const cslUtxos = getCslUtxos(utxosHex);
  txBuilder.add_inputs_from(cslUtxos, getLargestFirstMultiAsset());
  txBuilder.add_change_if_needed(cslChangeAddress);
  const cslUnsignedTransaction = txBuilder.build_tx();
  const txFee = cslUnsignedTransaction.body().fee().to_str();
  const cslUnsignedTxHex = bytesToHex(cslUnsignedTransaction.to_bytes());

  return {
    uTxHex: cslUnsignedTxHex,
    txFee,
  };
};
