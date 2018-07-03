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

Then(/^I should see no transactions$/, async function () {
  const actualTxsList = await this.getElementsBy('.Transaction_component');
  chai.expect(actualTxsList.length).to.equal(0);
});

Then(/^I should see ([^"]*) pending transactions in simple-wallet$/,
async function (pendingTxsNumber) {
  const actualTxsList = await this.getElementsBy('.Transaction_component');
  const expectedTxsList = getLovefieldTxs('simple-wallet');
  for (let i = 0; i < parseInt(pendingTxsNumber, 10); i++) {
    await actualTxsList[i].click();
    const txData = await actualTxsList[i].getText();
    const txDataFields = txData.split('\n');
    const [txType, txAmount, txTime, txStatus, , txFrom, , txTo, , , txId] = txDataFields;
    verifyAllTxsFields(txType, txAmount, txTime, txStatus, [txFrom],
        [txTo], txId, expectedTxsList[i]);
  }
});

Then(/^I should see ([^"]*) confirmed transactions in ([^"]*)$/,
async function (txsNumber, walletName) {
  const actualTxsList = await this.getElementsBy('.Transaction_component');
  const expectedTxsList = getLovefieldTxs(walletName);
  const initialTxValue = actualTxsList.length - parseInt(txsNumber, 10);
  for (let i = initialTxValue; i < actualTxsList.length; i++) {
    await actualTxsList[i].click();
    const txData = await actualTxsList[i].getText();
    const txDataFields = txData.split('\n');
    const [txType, txAmount, txTime, txStatus, , txFrom, , txTo, ,
      txConfirmations, , txId] = txDataFields;
    verifyAllTxsFields(txType, txAmount, txTime, txStatus, [txFrom],
      [txTo], txId, expectedTxsList[i], txConfirmations);
  }
});

Then(/^I should see a confirmed transactions in tx-big-input-wallet$/,
  async function () {
    const actualTxsList = await this.getElementsBy('.Transaction_component');
    const totalTxsNumber = actualTxsList.length;
    const expectedTxsList = getLovefieldTxs('tx-big-input-wallet');
    for (let i = 0; i < totalTxsNumber; i++) {
      await actualTxsList[i].click();
      const txData = await actualTxsList[i].getText();
      const txDataFields = txData.split('\n');
      const [txType, txAmount, txTime, txStatus, , txFrom1, txFrom2, txFrom3, , txTo1, txTo2,
        txTo3, txTo4, , txConfirmations, , txId] = txDataFields;
      verifyAllTxsFields(txType, txAmount, txTime, txStatus, [txFrom1, txFrom2, txFrom3],
        [txTo1, txTo2, txTo3, txTo4], txId, expectedTxsList[i], txConfirmations);
    }
  });
