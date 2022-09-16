// @flow

import { Then, When, Given } from 'cucumber';
import { By } from 'selenium-webdriver';
import chai from 'chai';
import moment from 'moment';
import i18n from '../support/helpers/i18n-helpers';
import {
  failedTransactionElement,
  noTransactionsComponent,
  numberOfTransactions,
  parseTxInfo,
  pendingTransactionElement,
  showMoreButton, transactionAddressListElement,
  transactionListElement,
} from '../pages/walletTransactionsPage';
import { summaryTab } from '../pages/walletPage';
import { displayInfo } from '../support/helpers/common-constants';

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
  chai.expect(txType).to.equal(expectedTx.txType);
  chai.expect(txAmount.split(' ')[0]).to.equal(expectedTx.txAmount);
  chai.expect(txTime).to.equal(moment(expectedTx.txTime).format('hh:mm:ss A'));
  chai.expect(txStatus).to.equal(expectedTx.txStatus);
  for (let i = 0; i < txFromList.length; i++) {
    for (let j = 0; j < txFromList[i].length; j++) {
      chai.expect(txFromList[i][j]).to.equal(expectedTx.txFrom[i][j]);
    }
  }
  for (let i = 0; i < txToList.length; i++) {
    for (let j = 0; j < txToList[i].length; j++) {
      chai.expect(txToList[i][j]).to.equal(expectedTx.txTo[i][j]);
    }
  }
  chai.expect(txId).to.equal(expectedTx.txId);
  if (txConfirmations) {
    chai.expect(txConfirmations).to.equal(expectedTx.txConfirmations);
  }
  if (txFee) {
    chai.expect(txFee).to.equal(expectedTx.txFee);
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
  const actualTxsList = await this.getElementsBy(transactionListElement);
  chai.expect(actualTxsList.length).to.equal(0);
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

  const allTxsList = await this.getElementsBy(transactionListElement);
  const pendingTxsList = await this.getElementsBy(pendingTransactionElement);
  const failedTxsList = await this.getElementsBy(failedTransactionElement);
  if (txExpectedStatus === 'pending') {
    chai.expect(pendingTxsList.length).to.equal(txsAmount);
    return;
  }
  if (txExpectedStatus === 'failed') {
    chai.expect(failedTxsList.length).to.equal(txsAmount);
    return;
  }
  chai.expect(allTxsList.length - pendingTxsList.length - failedTxsList.length).to.equal(txsAmount);
});

When(/^I expand the top transaction$/, async function () {
  await this.waitForElement(transactionListElement);
  const actualTxsList = await this.getElementsBy(transactionListElement);
  const topTx = actualTxsList[0];

  await topTx.click();
});

Then(/^I verify top transaction content ([^"]*)$/, async function (walletName) {
  await this.waitForElement(transactionListElement);
  const actualTxsList = await this.getElementsBy(transactionListElement);
  const topTx = actualTxsList[0];

  let status = 'successful';
  {
    const pending = await topTx.findElements(By.css('.Transaction_pendingLabel'));
    const failed = await topTx.findElements(By.css('.Transaction_failedLabel'));
    if (pending.length > 0) {
      status = 'pending';
    } else if (failed.length > 0) {
      status = 'failed';
    }
  }

  await topTx.click();

  const txList = await topTx.findElements(transactionAddressListElement);
  const fromTxInfo = await parseTxInfo(txList[0]);
  const toTxInfo = await parseTxInfo(txList[1]);

  const txData = await topTx.getText();
  const txDataFields = txData.split('\n');
  const [txTime, txType, txStatus, txFee, txAmount] = txDataFields;

  const expectedTx = displayInfo[walletName];

  const txId = await (async () => {
    const elem = await topTx.findElement(By.css('.txid'));
    return await elem.getText();
  })();
  const txConfirmation =
    status === 'successful'
      ? await (async () => {
          const txConfirmationsCount = await topTx.findElement(By.css('.confirmationCount'));
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

Then(/^The number of confirmations of the top tx is ([^"]*)$/, async function (count) {
  await this.waitForElement(transactionListElement);
  const actualTxsList = await this.getElementsBy(transactionListElement);
  const topTx = actualTxsList[0];
  const assuranceElem = await topTx.findElements(By.css('.confirmationCount'));
  const confirmationCount = await assuranceElem[0].getText();
  chai.expect(confirmationCount).to.equal(count);
});

When(/^I go to the tx history screen$/, async function () {
  await this.click(summaryTab);
});
