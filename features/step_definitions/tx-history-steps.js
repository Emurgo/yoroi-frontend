import { Then, When } from 'cucumber';
import chai from 'chai';
import moment from 'moment';
import { getLovefieldTxs } from '../support/mockDataBuilder';

function checkTxField(actualDataIndexes, txDataArray, lovefieldTx, fieldName, expectedDataIndexes) {
  for (let i = 0; i < actualDataIndexes.length; i++) {
    if (!expectedDataIndexes) {
      chai.expect(txDataArray[actualDataIndexes[i]]).to.equal(lovefieldTx[fieldName]);
    } else {
      chai.expect(txDataArray[actualDataIndexes[i]]).to
        .equal(lovefieldTx[fieldName][expectedDataIndexes[i]]);
    }
  }
}

Then(/^I go to Txs History tab$/, async function () {
  await this.clickByXpath("//*[contains(text(), 'Transactions')]");
});

When(/^I see the transactions summary$/, async function () {
  await this.waitForElement('.WalletSummary_numberOfTransactions');
});

Then(/^I should see that the number of transactions is ([^"]*)$/,
async function (expectedTxsNumber) {
  await this.waitForElement('.WalletSummary_numberOfTransactions');
  const txsNumber = await this.getText('.WalletSummary_numberOfTransactions');
  chai.expect(txsNumber).to.equal('Number of transactions: ' + expectedTxsNumber);
});

Then(/^I should see the txs corresponding to the wallet with the name ([^"]*)$/,
async function (walletName) {
  const txsList = await this.getElementsBy('.Transaction_component');
  const lovefieldTxs = getLovefieldTxs(walletName);
  for (let i = 0; i < txsList.length; i++) {
    await txsList[i].click();
    const txData = await txsList[i].getText();
    const txDataArray = txData.split('\n');
    chai.expect(txDataArray[0]).to.equal(lovefieldTxs[i].txType);
    chai.expect(txDataArray[1].split(' ')[0]).to.equal(lovefieldTxs[i].txAmount);
    chai.expect(txDataArray[2]).to.equal(lovefieldTxs[i].txTimeTitle + ' ' +
      moment(lovefieldTxs[i].txTime).format('hh:mm:ss A'));
    chai.expect(txDataArray[3]).to.equal(lovefieldTxs[i].txStatus);

    // Checks whether it belongs to a single tx or a tx list
    const txFromIndexes = txsList.length === 1 ? [5, 6, 7] : [5];
    const txToIndexes = txsList.length === 1 ? [9, 10, 11, 12] : [7];
    const txConfirmationIndexes = txsList.length === 1 ? [14] : [9];

    checkTxField(txFromIndexes, txDataArray, lovefieldTxs[i], 'txFrom', [0, 1, 2]);
    checkTxField(txToIndexes, txDataArray, lovefieldTxs[i], 'txTo', [0, 1, 2, 3]);

    // Checks whether the tx is pending or not
    if (lovefieldTxs[i].txStatus !== 'TRANSACTION PENDING') {
      const txIdIndexes = txsList.length === 1 ? [16] : [11];
      checkTxField(txConfirmationIndexes, txDataArray, lovefieldTxs[i], 'txConfirmations');
      checkTxField(txIdIndexes, txDataArray, lovefieldTxs[i], 'txId');
    } else {
      const txIdIndexes = txsList.length === 1 ? [15] : [10];
      checkTxField(txIdIndexes, txDataArray, lovefieldTxs[i], 'txId');
    }
  }
});
