// @flow

import { Then, When, Given } from 'cucumber';
import { By } from 'selenium-webdriver';
import chai from 'chai';
import moment from 'moment';
import i18n from '../support/helpers/i18n-helpers';

function verifyAllTxsFields(txType, txAmount, txTime, txStatus, txFee, txFromList, txToList,
  txId, expectedTx, txConfirmations) {
  chai.expect(txType).to.equal(expectedTx.txType);
  chai.expect(txAmount.split(' ')[0]).to.equal(expectedTx.txAmount);
  chai.expect(txTime).to.equal(moment(expectedTx.txTime).format('hh:mm:ss A'));
  chai.expect(txStatus).to.equal(expectedTx.txStatus);
  for (let i = 0; i < txFromList.length; i++) {
    chai.expect(txFromList[i]).to.equal(expectedTx.txFrom[i]);
  }
  for (let i = 0; i < txToList.length; i++) {
    chai.expect(txToList[i]).to.equal(expectedTx.txTo[i]);
  }
  chai.expect(txId).to.equal(expectedTx.txId);
  if (txConfirmations) {
    chai.expect(txConfirmations).to.equal(expectedTx.txConfirmations);
  }
  if (txFee) {
    chai.expect(txFee).to.equal(expectedTx.txFee);
  }
}

function mapConditionalFields(txExpectedStatus, conditionalFields) {
  if (txExpectedStatus === 'pending') {
    const [txId] = conditionalFields;
    return [txId, undefined];
  }
  if (txExpectedStatus === 'failed') {
    const [, txId] = conditionalFields;
    return [txId, undefined];
  }
  const [, txConfirmations, , txId] = conditionalFields;
  return [txId, txConfirmations];
}

Given(/^There are ([0-9]+) generated addresses$/, async function (lastReceiveIndex) {
  await this.saveLastReceiveAddressIndex(Number(lastReceiveIndex) - 1);
});

When(/^I see the transactions summary$/, async function () {
  // sometimes this UI twitches on load when it starts fetching data from the server
  // sleep to avoid the twitch breaking the test
  await this.driver.sleep(500);
  await this.waitForElement('.WalletSummary_numberOfTransactions');
});

Then(
  /^I should see that the number of transactions is ([^"]*)$/,
  async function (expectedTxsNumber) {
    const txsNumberMessage = await i18n.formatMessage(this.driver,
      { id: 'wallet.summary.page.transactionsLabel' });
    await this.waitUntilText(
      '.WalletSummary_numberOfTransactions',
      txsNumberMessage + ': ' + expectedTxsNumber
    );
  }
);


Then(/^I should see no transactions$/, async function () {
  await this.waitForElement('.WalletNoTransactions_component');
  const actualTxsList = await this.getElementsBy('.Transaction_component');
  chai.expect(actualTxsList.length).to.equal(0);
});

Then(
  /^I should see ([^"]*) ([^"]*) transactions$/,
  async function (txsNumber, txExpectedStatus) {
    const txsAmount = parseInt(txsNumber, 10);

    await this.driver.sleep(500);
    // press the show more transaction button until all transactions are visible
    for (let i = 1; i < txsAmount; i++) {
      const webElements = await this.driver.findElements(By.xpath(`//button[contains(@class, 'primary WalletTransactionsList_showMoreTransactionsButton')]`));
      if (webElements.length === 0) {
        break;
      }
      await this.click(`//button[contains(@class, 'primary WalletTransactionsList_showMoreTransactionsButton')]`, By.xpath);
      await this.driver.sleep(500);
    }

    const allTxsList = await this.getElementsBy('.Transaction_component');
    const pendingTxsList = await this.getElementsBy('.Transaction_pendingLabel');
    const failedTxsList = await this.getElementsBy('.Transaction_failedLabel');
    if (txExpectedStatus === 'pending') {
      chai.expect(pendingTxsList.length).to.equal(txsAmount);
      return;
    }
    if (txExpectedStatus === 'failed') {
      chai.expect(failedTxsList.length).to.equal(txsAmount);
      return;
    }
    chai.expect(allTxsList.length - pendingTxsList.length - failedTxsList.length)
      .to.equal(txsAmount);
  }
);

When(
  /^I expand the top transaction$/,
  async function () {
    await this.waitForElement('.Transaction_component');
    const actualTxsList = await this.getElementsBy('.Transaction_component');
    const topTx = actualTxsList[0];

    await topTx.click();
  }
);

Then(
  /^I verify top transaction content ([^"]*)$/,
  async function (walletName) {
    await this.waitForElement('.Transaction_component');
    const actualTxsList = await this.getElementsBy('.Transaction_component');
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
    const txData = await topTx.getText();
    const txDataFields = txData.split('\n');
    const [txTime, txType, txStatus, txFee, txAmount] = txDataFields;

    let txFrom;
    let txTo;
    let conditionalFields;

    if (txType === 'ADA received') {
      // Exclude fee
      [, , , , , txFrom, , txTo, , ...conditionalFields]
        = txDataFields;

    } else {
      [, , , , , , txFrom, , txTo, , ...conditionalFields]
        = txDataFields;
    }

    const expectedTx = displayInfo[walletName];

    const [txId, txConfirmations] = mapConditionalFields(status, conditionalFields);
    verifyAllTxsFields(txType, txAmount, txTime, txStatus, txFee, [txFrom],
      [txTo], txId, expectedTx, txConfirmations);
  }
);

const displayInfo = {
  'many-tx-wallet': {
    txType: 'ADA intrawallet transaction',
    txAmount: '-0.169999',
    txTime: '2019-04-21T15:13:33.000Z',
    txStatus: 'HIGH',
    txFrom: ['Ae2tdPwUPEZ77uBBu8cMVxswVy1xfaMZR9wsUSwDNiB48MWqsVWfitHfUM9'],
    txTo: [
      'Ae2tdPwUPEYzkKjrqPw1GHUty25Cj5fWrBVsWxiQYCxfoe2d9iLjTnt34Aj',
      'Ae2tdPwUPEZ7VKG9jy6jJTxQCWNXoMeL2Airvzjv3dc3WCLhSBA7XbSMhKd',
    ],
    txId: '0a073669845fea4ae83cd4418a0b4fd56610097a89601a816b5891f667e3496c',
    txConfirmations: 'High. 103 confirmations.',
    txFee: '0.169999',
  },
  'simple-pending-wallet': {
    txType: 'ADA intrawallet transaction',
    txAmount: '-0.999999',
    txTime: '2019-04-20T23:14:52.000Z',
    txStatus: 'PENDING',
    txFrom: ['Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ'],
    txTo: [
      'Ae2tdPwUPEYwEnNsuY9uMAphecEWipHKEy9g8yZCJTJm4zxV1sTrQfTxPVX',
    ],
    txId: 'fa6f2c82fb511d0cc9c12a540b5fac6e5a9b0f288f2d140f909f981279e16fbe',
    txFee: '0.999999',
  },
  'failed-single-tx': {
    txType: 'ADA sent',
    txAmount: '-0.180000',
    txTime: '2019-04-20T23:14:51.000Z',
    txStatus: 'FAILED',
    txFrom: ['Ae2tdPwUPEYw8ScZrAvKbxai1TzG7BGC4n8PoF9JzE1abgHc3gBfkkDNBNv'],
    txTo: [
      'Ae2tdPwUPEZCdSLM7bHhoC6xptW9SRW155PFFf4WYCKnpX4JrxJPmFzi6G2',
      'Ae2tdPwUPEZCqWsJkibw8BK2SgbmJ1rRG142Ru1CjSnRvKwDWbL4UYPN3eU',
    ],
    txId: 'fc6a5f086c0810de3048651ddd9075e6e5543bf59cdfe5e0c73bf1ed9dcec1ab',
    txFee: '0.179999',
  },
};
