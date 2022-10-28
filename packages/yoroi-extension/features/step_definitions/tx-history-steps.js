// @flow

import { Then, When, Given } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect, AssertionError } from 'chai';
import moment from 'moment';
import i18n from '../support/helpers/i18n-helpers';
import {
  confirmationCountText,
  failedTransactionElement,
  getTopTx,
  getTxStatus,
  noTransactionsComponent,
  numberOfTransactions,
  parseTxInfo,
  pendingTransactionElement,
  showMoreButton,
  transactionAddressListElement,
  transactionComponent, transactionIdText,
} from '../pages/walletTransactionsHistoryPage';
import { summaryTab } from '../pages/walletPage';
import { displayInfo , txSuccessfulStatuses } from '../support/helpers/common-constants';
import { getMethod } from '../support/helpers/helpers';
import { adaToFiatPrices } from '../support/helpers/common-constants';

const axios = require('axios');

function verifyAllTxsFields(
  txType,
  txAmount,
  txTime,
  txStatus,
  txFee,
  txFromList,
  txToList,
  txId,
  expectedTx,
  txConfirmations
) {
  expect(txType).to.equal(expectedTx.txType);
  expect(txAmount.split(' ')[0]).to.equal(expectedTx.txAmount);
  expect(txTime).to.equal(moment(expectedTx.txTime).format('hh:mm:ss A'));
  expect(txStatus).to.equal(expectedTx.txStatus);
  for (let i = 0; i < txFromList.length; i++) {
    for (let j = 0; j < txFromList[i].length; j++) {
      expect(txFromList[i][j]).to.equal(expectedTx.txFrom[i][j]);
    }
  }
  for (let i = 0; i < txToList.length; i++) {
    for (let j = 0; j < txToList[i].length; j++) {
      expect(txToList[i][j]).to.equal(expectedTx.txTo[i][j]);
    }
  }
  expect(txId).to.equal(expectedTx.txId);
  if (txConfirmations) {
    expect(txConfirmations).to.equal(expectedTx.txConfirmations);
  }
  if (txFee) {
    expect(txFee).to.equal(expectedTx.txFee);
  }
}

Given(/^There are ([0-9]+) generated addresses$/, async function (lastReceiveIndex) {
  await this.saveLastReceiveAddressIndex(Number(lastReceiveIndex) - 1);
});

When(/^I see the transactions summary$/, async function () {
  // sometimes this UI twitches on load when it starts fetching data from the server
  // sleep to avoid the twitch breaking the test
  await this.driver.sleep(500);
  await this.waitForElement(numberOfTransactions);
});

Then(
  /^I should see that the number of transactions is ([^"]*)$/,
  async function (expectedTxsNumber) {
    const txsNumberMessage = await i18n.formatMessage(this.driver, {
      id: 'wallet.summary.page.transactionsLabel',
    });
    await this.waitUntilText(numberOfTransactions, txsNumberMessage + ': ' + expectedTxsNumber);
  }
);

Then(/^I should see no transactions$/, async function () {
  await this.waitForElement(noTransactionsComponent);
  const actualTxsList = await this.getElementsBy(transactionComponent);
  expect(actualTxsList.length).to.equal(0);
});

Then(/^I should see ([^"]*) ([^"]*) transactions$/, async function (txsNumber, txExpectedStatus) {
  const txsAmount = parseInt(txsNumber, 10);

  await this.driver.sleep(500);
  // press the show more transaction button until all transactions are visible
  for (let i = 1; i < txsAmount; i++) {
    const buttonShowMoreExists = await this.checkIfExists(showMoreButton);
    if (!buttonShowMoreExists) {
      break;
    }
    await this.click(showMoreButton);
    await this.driver.sleep(500);
  }

    if (txExpectedStatus === 'pending') {
      const pendingTxsList = await this.getElementsBy(pendingTransactionElement);
      expect(pendingTxsList.length).to.equal(txsAmount);
      return;
    }
    if (txExpectedStatus === 'failed') {
      const failedTxsList = await this.getElementsBy(failedTransactionElement);
      expect(failedTxsList.length).to.equal(txsAmount);
      return;
    }
    const pendingTxsList = await this.getElementsBy(pendingTransactionElement);
    const failedTxsList = await this.getElementsBy(failedTransactionElement);
    const allTxsList = await this.getElementsBy(transactionComponent);
    expect(allTxsList.length - pendingTxsList.length - failedTxsList.length)
      .to.equal(txsAmount);
  }
);

When(/^I expand the top transaction$/, async function () {
    await this.waitForElement(transactionComponent);
    const actualTxsList = await this.getElementsBy(transactionComponent);
    const topTx = actualTxsList[0];

    await topTx.click();
});

Then(/^I verify top transaction content ([^"]*)$/, async function (walletName) {
  await this.waitForElement(transactionComponent);
  const actualTxsList = await this.getElementsBy(transactionComponent);
  const topTx = actualTxsList[0];

  let status = 'successful';
  const pending = await topTx.findElements(
    getMethod(pendingTransactionElement.method)(pendingTransactionElement.locator)
  );
  const failed = await topTx.findElements(
    getMethod(failedTransactionElement.method)(failedTransactionElement.locator)
  );
  if (pending.length > 0) {
    status = 'pending';
  } else if (failed.length > 0) {
    status = 'failed';
  }

  await topTx.click();

  const txList = await topTx.findElements(
    getMethod(transactionAddressListElement.method)(transactionAddressListElement.locator)
  );
  const fromTxInfo = await parseTxInfo(txList[0]);
  const toTxInfo = await parseTxInfo(txList[1]);

  const txData = await topTx.getText();
  const txDataFields = txData.split('\n');
  const [txTime, txType, txStatus, txFee, txAmount] = txDataFields;

  const expectedTx = displayInfo[walletName];

  const txId = await (async () => {
    const elem = await topTx.findElement(
      getMethod(transactionIdText.method)(transactionIdText.locator)
    );
    return await elem.getText();
  })();
  const txConfirmation =
    status === 'successful'
      ? await (async () => {
          const txConfirmationsCount = await topTx.findElement(
            getMethod(confirmationCountText.method)(confirmationCountText.locator)
          );
          const txConfirmationParentElem = await txConfirmationsCount.findElement(By.xpath('./..'));
          return await txConfirmationParentElem.getText();
        })()
      : undefined;

  verifyAllTxsFields(
    txType,
    txAmount,
    txTime,
    txStatus,
    txFee,
    fromTxInfo,
    toTxInfo,
    txId,
    expectedTx,
    txConfirmation
  );
});

Then(
  /^The number of confirmations of the top tx is ([^"]*)$/, async function (count) {
    await this.waitForElement(transactionComponent);
    const actualTxsList = await this.getElementsBy(transactionComponent);
    const topTx = actualTxsList[0];
    const assuranceElem = await topTx.findElements(
      getMethod(confirmationCountText.method)(confirmationCountText.locator)
    );
    const confirmationCount = await assuranceElem[0].getText();
    expect(confirmationCount).to.equal(count);
});

When(/^I go to the tx history screen$/, async function () {
  await this.click(summaryTab);
});

Then(/^I wait for (\d+) minute\(s\) the last transaction is confirmed$/, async function (minutes) {
  const waitTimeMs = parseInt(minutes, 10) * 60 * 1000;
  this.webDriverLogger.info(`Step: I wait for ${minutes} minute(s) the last transaction is confirmed`);
  const startTime = Date.now();
  while (startTime + waitTimeMs > Date.now()){
    const topTx = await getTopTx(this);
    const topTxState = await getTxStatus(topTx);
    if(txSuccessfulStatuses.includes(topTxState.toLowerCase())){
      const endTime = Date.now();
      this.webDriverLogger.info(`Step: The new transaction is confirmed`);
      this.webDriverLogger.info(`Step: Waiting time is ${(endTime - startTime) / 1000} seconds`);
      return;
    }
    await this.driver.sleep(1000);
  }
  const endTime = Date.now();
  this.webDriverLogger.error(`The latest transaction is still in status "Submitted" after ${minutes} minutes (${(endTime - startTime) / 1000})`);
  throw new AssertionError(`The latest transaction is still in status "Submitted" after ${minutes} minutes`);
});
Then(
  /^I validate the transaction amount to (USD|JPY|EUR|CNY|KRW|BTC|ETH|BRL) currency pairing$/,
  async function (currency) {
    const response = await axios(adaToFiatPrices);
    const rate = await response.data.ticker.prices[currency];

    const allTxsList = await this.findElements(txRowComponent);
    for (const txListElement of allTxsList) {
      const txAmount = await getTxAmount(txListElement);
      expect(txAmount).to.contain(currency);

      const amountList = txAmount.split('\n');
      const fiatAmount = amountList[0].replace(currency, '');
      const adaAmount = parseFloat(amountList[1].replace('ADA', ''));

      const expectedValue = parseFloat((adaAmount * rate).toFixed(6));
      expect(fiatAmount).to.contain(`${expectedValue}`);
    }
  }
);
