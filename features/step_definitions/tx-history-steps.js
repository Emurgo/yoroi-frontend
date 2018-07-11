import { Then, When } from 'cucumber';
import chai from 'chai';
import moment from 'moment';
import { getLovefieldTxs } from '../support/mockDataBuilder';

function verifyAllTxsFields(txType, txAmount, txTime, txStatus, txFromList, txToList,
  txId, expectedTx, txConfirmations) {
  chai.expect(txType).to.equal(expectedTx.txType);
  chai.expect(txAmount.split(' ')[0]).to.equal(expectedTx.txAmount);
  chai.expect(txTime).to.equal(expectedTx.txTimeTitle + ' ' +
    moment(expectedTx.txTime).format('hh:mm:ss A'));
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
}

function mapPendingTxFields(txExpectedStatus, pendingTxFields) {
  if (txExpectedStatus === 'pending') {
    const [, txId] = pendingTxFields;
    return [txId];
  }
  const [txConfirmations, , txId] = pendingTxFields;
  return [txId, txConfirmations];
}

Then(/^I go to Txs History tab$/, async function () {
  await this.clickByXpath("//*[contains(text(), 'Transactions')]");
});

When(/^I see the transactions summary$/, async function () {
  await this.waitForElement('.WalletSummary_numberOfTransactions');
});

Then(/^I should see that the number of transactions is ([^"]*)$/,
async function (expectedTxsNumber) {
  await this.waitUntilText(
    '.WalletSummary_numberOfTransactions',
    'Number of transactions: ' + expectedTxsNumber
  );
});

Then(/^I should see no transactions$/, async function () {
  const actualTxsList = await this.getElementsBy('.Transaction_component');
  chai.expect(actualTxsList.length).to.equal(0);
});

Then(/^I should see ([^"]*) ([^"]*) transactions in ([^"]*)$/,
async function (txsNumber, txExpectedStatus, walletName) {
  const actualTxsList = await this.getElementsBy('.Transaction_component');
  const expectedTxsList = getLovefieldTxs(walletName);
  const firstIndex = txExpectedStatus === 'pending' ?
    0 : (actualTxsList.length - parseInt(txsNumber.length, 10));
  const lastIndex = txExpectedStatus === 'pending' ?
    parseInt(txsNumber, 10) : actualTxsList.length;
  for (let i = firstIndex; i < lastIndex; i++) {
    await actualTxsList[i].click();
    const txData = await actualTxsList[i].getText();
    const txDataFields = txData.split('\n');
    const [txType, txAmount, txTime, txStatus, , txFrom, , txTo, , ...pendingTxFields]
      = txDataFields;
    const [txId, txConfirmations] = mapPendingTxFields(txExpectedStatus, pendingTxFields);
    verifyAllTxsFields(txType, txAmount, txTime, txStatus, [txFrom],
        [txTo], txId, expectedTxsList[i], txConfirmations);
  }
});
