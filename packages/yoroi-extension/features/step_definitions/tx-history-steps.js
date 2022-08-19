// @flow

import { Then, When, Given } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect, AssertionError } from 'chai';
import moment from 'moment';
import i18n from '../support/helpers/i18n-helpers';
import { getTopTx, getTxStatus, transactionComponent } from '../pages/walletTransactionsHistoryPage';
import { txSuccessfulStatuses } from '../support/helpers/common-constants';

function verifyAllTxsFields(
  txType, txAmount, txTime, txStatus, txFee, txFromList, txToList,
  txId, expectedTx, txConfirmations
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
  await this.waitForElement({ locator: '.WalletSummary_numberOfTransactions', method: 'css' });
});

Then(
  /^I should see that the number of transactions is ([^"]*)$/,
  async function (expectedTxsNumber) {
    const txsNumberMessage = await i18n.formatMessage(this.driver,
      { id: 'wallet.summary.page.transactionsLabel' });
    await this.waitUntilText(
      { locator: '.WalletSummary_numberOfTransactions', method: 'css' },
      txsNumberMessage + ': ' + expectedTxsNumber
    );
  }
);


Then(/^I should see no transactions$/, async function () {
  await this.waitForElement({ locator: '.WalletNoTransactions_component', method: 'css' });
  const actualTxsList = await this.getElementsBy(transactionComponent);
  expect(actualTxsList.length).to.equal(0);
});

Then(
  /^I should see ([^"]*) ([^"]*) transactions$/,
  async function (txsNumber, txExpectedStatus) {
    const txsAmount = parseInt(txsNumber, 10);
    const showMoreLocator = '.WalletTransactionsList_component .MuiButton-primary';

    await this.driver.sleep(500);
    // press the show more transaction button until all transactions are visible
    for (let i = 1; i < txsAmount; i++) {
      const buttonShowMoreExists = await this.checkIfExists({ locator: showMoreLocator, method: 'css' });
      if (!buttonShowMoreExists) {
        break;
      }
      await this.click({ locator: showMoreLocator, method: 'css' });
      await this.driver.sleep(500);
    }

    if (txExpectedStatus === 'pending') {
      const pendingTxsList = await this.getElementsBy({ locator: '.Transaction_pendingLabel', method: 'css' });
      expect(pendingTxsList.length).to.equal(txsAmount);
      return;
    }
    if (txExpectedStatus === 'failed') {
      const failedTxsList = await this.getElementsBy({ locator: '.Transaction_failedLabel', method: 'css' });
      expect(failedTxsList.length).to.equal(txsAmount);
      return;
    }
    const pendingTxsList = await this.getElementsBy({ locator: '.Transaction_pendingLabel', method: 'css' });
    const failedTxsList = await this.getElementsBy({ locator: '.Transaction_failedLabel', method: 'css' });
    const allTxsList = await this.getElementsBy(transactionComponent);
    expect(allTxsList.length - pendingTxsList.length - failedTxsList.length)
      .to.equal(txsAmount);
  }
);

When(
  /^I expand the top transaction$/,
  async function () {
    await this.waitForElement(transactionComponent);
    const actualTxsList = await this.getElementsBy(transactionComponent);
    const topTx = actualTxsList[0];

    await topTx.click();
  }
);

async function parseTxInfo(addressList) {
  const addressInfoRow = await addressList.findElements(By.css('.Transaction_addressItem'));

  const result = [];
  for (const row of addressInfoRow) {
    const rowInfo = await row.findElements(By.xpath('*'));
    const rowInfoText = await Promise.all(rowInfo.map(async column => await column.getText()));
    result.push(rowInfoText);
  }

  return result;
}

Then(
  /^I verify top transaction content ([^"]*)$/,
  async function (walletName) {
    await this.waitForElement(transactionComponent);
    const actualTxsList = await this.getElementsBy(transactionComponent);
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

    const txList = await topTx.findElements(By.css('.Transaction_addressList'));
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

    verifyAllTxsFields(txType, txAmount, txTime, txStatus, txFee, fromTxInfo,
      toTxInfo, txId, expectedTx, txConfirmation);
  }
);

Then(
  /^The number of confirmations of the top tx is ([^"]*)$/,
  async function (count) {
    await this.waitForElement(transactionComponent);
    const actualTxsList = await this.getElementsBy(transactionComponent);
    const topTx = actualTxsList[0];
    const assuranceElem = await topTx.findElements(By.css('.confirmationCount'));
    const confirmationCount = await assuranceElem[0].getText();
    expect(confirmationCount).to.equal(count);
  }
);

const displayInfo = {
  'many-tx-wallet': {
    txType: 'ADA intrawallet transaction',
    txAmount: '-0.169999',
    txTime: '2019-04-21T15:13:33.000Z',
    txStatus: 'HIGH',
    txFrom: [
      ['Ae2tdPwUPE...VWfitHfUM9', 'BYRON - INTERNAL', '-0.82 ADA'],
    ],
    txTo: [
      ['Ae2tdPwUPE...iLjTnt34Aj', 'BYRON - EXTERNAL', '+0.000001 ADA'],
      ['Ae2tdPwUPE...BA7XbSMhKd', 'BYRON - INTERNAL', '+0.65 ADA'],
    ],
    txId: '0a073669845fea4ae83cd4418a0b4fd56610097a89601a816b5891f667e3496c',
    txConfirmations: 'High. 104 confirmations.',
    txFee: '0.169999',
  },
  'simple-pending-wallet': {
    txType: 'ADA intrawallet transaction',
    txAmount: '-0.999999',
    txTime: '2019-04-20T23:14:52.000Z',
    txStatus: 'PENDING',
    txFrom: [
      ['Ae2tdPwUPE...e1cT2aGdSJ', 'BYRON - EXTERNAL', '-1 ADA'],
    ],
    txTo: [
      ['Ae2tdPwUPE...sTrQfTxPVX', 'PROCESSING...', '+0.000001 ADA']
    ],
    txId: 'fa6f2c82fb511d0cc9c12a540b5fac6e5a9b0f288f2d140f909f981279e16fbe',
    txFee: '0.999999',
  },
  'failed-single-tx': {
    txType: 'ADA sent',
    txAmount: '-0.18',
    txTime: '2019-04-20T23:14:51.000Z',
    txStatus: 'FAILED',
    txFrom: [
      ['Ae2tdPwUPE...gBfkkDNBNv', 'BYRON - EXTERNAL', '-1 ADA'],
    ],
    txTo: [
      ['Ae2tdPwUPE...xJPmFzi6G2', 'ADDRESS BOOK', '+0.000001 ADA'],
      ['Ae2tdPwUPE...bL4UYPN3eU', 'BYRON - INTERNAL', '+0.82 ADA'],
    ],
    txId: 'fc6a5f086c0810de3048651ddd9075e6e5543bf59cdfe5e0c73bf1ed9dcec1ab',
    txFee: '0.179999',
  },
};

When(/^I go to the tx history screen$/, async function () {
  await this.click({ locator: '.summary ', method: 'css' });
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
  this.webDriverLogger.error(`The latest transaction is still in status "Submitted" after ${minutes} minutes`);
  throw new AssertionError(`The latest transaction is still in status "Submitted" after ${minutes} minutes`);
});