// @flow

import { Then, When, Given } from 'cucumber';
import { By } from 'selenium-webdriver';
import chai from 'chai';
import moment from 'moment';
import { getLovefieldTxs, getFeatureData } from '../support/mockDataBuilder';
import i18n from '../support/helpers/i18n-helpers';

function verifyAllTxsFields(txType, txAmount, txTime, txStatus, txFromList, txToList,
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
}

function mapPendingTxFields(txExpectedStatus, pendingTxFields) {
  if (txExpectedStatus === 'pending') {
    const [, txId] = pendingTxFields;
    return [txId];
  }
  const [txConfirmations, , txId] = pendingTxFields;
  return [txId, txConfirmations];
}

Given(/^There are transactions already stored$/, async function () {
  const featureData = getFeatureData();
  const storedTxs = featureData
    ? featureData.lovefieldStoredTxs
    : undefined;
  chai.assert(storedTxs !== undefined);
  // refine type
  if (storedTxs === undefined) return;

  const transactions = storedTxs['simple-wallet'];
  const formattedTransactions = transactions.map(tx => {
    const newTx = Object.assign(
      {},
      tx,
      { ctMeta: {
        ctmDate: new Date(tx.ctMeta.ctmDate),
        ctmUpdate: new Date(tx.ctMeta.ctmUpdate)
      } }
    );
    return newTx;
  });
  await this.saveTxsToDB(formattedTransactions);
});

When(/^I see the transactions summary$/, async function () {
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
  const actualTxsList = await this.getElementsBy('.Transaction_component');
  chai.expect(actualTxsList.length).to.equal(0);
});

Then(
  /^I should see ([^"]*) ([^"]*) transactions in ([^"]*)$/,
  async function (txsNumber, txExpectedStatus, walletName) {
    const txsAmount = parseInt(txsNumber, 10);
    for (let i = 1; i < txsAmount; i++) {
      const webElements = await this.driver.findElements(By.xpath(`//button[contains(@class, 'primary WalletTransactionsList_showMoreTransactionsButton')]`));
      if (webElements.length === 0) {
        break;
      }
      await this.click(`//button[contains(@class, 'primary WalletTransactionsList_showMoreTransactionsButton')]`, By.xpath);

    }
    const expectedTxsList = getLovefieldTxs(walletName);
    /* TODO: these code needs to wait for something before check that each field is correct
      It would be better to wait until each element exist with the correct information.
    */
    await this.waitForElementLocated(
      `//span[contains(text(), "${expectedTxsList[expectedTxsList.length - 1].txId}")]`,
      By.xpath
    );

    const actualTxsList = await this.getElementsBy('.Transaction_component');
    const firstIndex = txExpectedStatus === 'pending' ? 0 : (actualTxsList.length - txsAmount);
    const lastIndex = txExpectedStatus === 'pending' ? txsAmount : actualTxsList.length;
    for (let i = firstIndex; i < lastIndex; i++) {
      const clickeableElement = actualTxsList[i];
      await clickeableElement.click();
      const txData = await actualTxsList[i].getText();
      const txDataFields = txData.split('\n');
      const [txType, txTime, txStatus, txAmount, , txFrom, , txTo, , ...pendingTxFields]
        = txDataFields;
      const [txId, txConfirmations] = mapPendingTxFields(txExpectedStatus, pendingTxFields);
      verifyAllTxsFields(txType, txAmount, txTime, txStatus, [txFrom],
        [txTo], txId, expectedTxsList[i], txConfirmations);
    }
  }
);

Then(
  /^I should see ([^"]*) transactions in complex-wallet on main screen$/,
  async function (txsNumber) {
    const txsAmount = parseInt(txsNumber, 10);
    for (let i = 1; i < txsAmount; i++) {
      const webElements = await this.driver.findElements(By.xpath(`//button[contains(@class, 'primary WalletTransactionsList_showMoreTransactionsButton')]`));
      if (webElements.length === 0) {
        break;
      }
      await this.click(`//button[contains(@class, 'primary WalletTransactionsList_showMoreTransactionsButton')]`, By.xpath);
      await this.driver.sleep(500);
    }
    const displayedTransactions = await this.driver.findElements(By.xpath(`//div[contains(@class, 'Transaction_component')]`));
    await this.driver.findElement(By.xpath(`//div[contains(@class, 'WalletSummary_numberOfTransactions')]//span`)).getText().then(numberOfTransactions => (
      chai.expect(parseInt(numberOfTransactions, 10)).to.equal(displayedTransactions.length)
    ));
  }
);
