// @flow

import { Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import chai from 'chai';
import { MAX_MEMO_SIZE } from '../../app/config/externalStorageConfig';

Then(/^I add a memo that says "([^"]*)"$/, async function (memo) {
  await this.click({ locator: '.addMemoButton', method: 'css' });
  await this.click({ locator: '.primary', method: 'css' });
  await this.input({ locator: "input[name='memoContent']", method: 'css' }, memo);
  await this.click({ locator: '.primary', method: 'css' });
});

Then(/^The memo content says "([^"]*)"$/, async function (memo) {
  await this.waitForElement({ locator: '.memoContent', method: 'css' });
  const memoElem = await this.getElementsBy({ locator: '.memoContent', method: 'css' });
  const memoContent = await memoElem[0].getText();
  chai.expect(memoContent).to.equal(memo);
});

Then(/^I edit the memo to say "([^"]*)"$/, async function (memo) {
  await this.click({ locator: '.editMemoButton', method: 'css' });
  await this.click({ locator: '.primary', method: 'css' });
  await this.clearInputUpdatingForm({ locator: "input[name='memoContent']", method: 'css' }, MAX_MEMO_SIZE);
  await this.input({ locator: "input[name='memoContent']", method: 'css' }, memo);
  await this.click({ locator: '.primary', method: 'css' });
});

Then(/^I delete the memo$/, async function () {
  await this.click({ locator: '.editMemoButton', method: 'css' });
  await this.click({ locator: '.primary', method: 'css' });
  let memoComponent = await this.driver.findElement(By.css('.MemoDialogCommon_component'));
  const deleteButton = await memoComponent.findElement(By.xpath('//button[@aria-label="delete memo"]'));
  await deleteButton.click();
  memoComponent = await this.driver.findElement(By.css('.MemoDialogCommon_component'));
  const confirmDelete = await memoComponent.findElement(By.xpath('//button[contains(text(), "Delete")]'));
  await confirmDelete.click();
});

Then(/^There is no memo for the transaction$/, async function () {
  await this.waitForElement({ locator: '.addMemoButton', method: 'css' });
});

Then(/^I add a transaction memo that says "([^"]*)"$/, async function (memo) {
  await this.driver.sleep(500);
  await this.click({ locator: '.addMemoButton', method: 'css' });
  await this.driver.sleep(500);
  await this.click({ locator: '.MemoDialogCommon_component .primary', method: 'css' });
  await this.driver.sleep(500);
  await this.input({ locator: "input[name='memo']", method: 'css' }, memo);
});
