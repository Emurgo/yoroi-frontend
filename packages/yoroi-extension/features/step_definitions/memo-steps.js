// @flow

import { Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import chai from 'chai';
import { MAX_MEMO_SIZE } from '../../app/config/externalStorageConfig';

Then(/^I add a memo that says "([^"]*)"$/, async function (memo) {
  await this.click('.addMemoButton');
  await this.click('.primary');
  await this.input("input[name='memoContent']", memo);
  await this.click('.primary');
});

Then(/^The memo content says "([^"]*)"$/, async function (memo) {
  await this.waitForElement('.memoContent');
  const memoElem = await this.getElementsBy('.memoContent');
  const memoContent = await memoElem[0].getText();
  chai.expect(memoContent).to.equal(memo);
});

Then(/^I edit the memo to say "([^"]*)"$/, async function (memo) {
  await this.click('.editMemoButton');
  await this.click('.primary');
  await this.clearInputUpdatingForm("input[name='memoContent']", MAX_MEMO_SIZE);
  await this.input("input[name='memoContent']", memo);
  await this.click('.primary');
});

Then(/^I delete the memo$/, async function () {
  await this.click('.editMemoButton');
  await this.click('.primary');
  let memoComponent = await this.driver.findElement(By.css('.MemoDialogCommon_component'));
  const deleteButton = await memoComponent.findElement(By.xpath('//button[@aria-label="delete memo"]'));
  await deleteButton.click();
  memoComponent = await this.driver.findElement(By.css('.MemoDialogCommon_component'));
  const confirmDelete = await memoComponent.findElement(By.xpath('//button[contains(text(), "Delete")]'));
  await confirmDelete.click();
});

Then(/^There is no memo for the transaction$/, async function () {
  await this.waitForElement('.addMemoButton');
});

Then(/^I add a transaction memo that says "([^"]*)"$/, async function (memo) {
  await this.driver.sleep(500);
  await this.click('.addMemoButton');
  await this.driver.sleep(500);
  await this.click('.MemoDialogCommon_component .primary');
  await this.driver.sleep(500);
  await this.input("input[name='memo']", memo);
});
