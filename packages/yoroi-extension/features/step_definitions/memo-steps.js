// @flow

import { Then } from 'cucumber';
import chai from 'chai';
import { MAX_MEMO_SIZE } from '../../app/config/externalStorageConfig';
import { primaryButton } from '../pages/commonDialogPage';
import {
  addMemoButton,
  deleteMemo,
  editMemoButton,
  getMemoText,
  memoContentInput,
} from '../pages/walletSendPage';

Then(/^I add a memo that says "([^"]*)"$/, async function (memo) {
  await this.click(addMemoButton);
  await this.click(primaryButton);
  await this.input(memoContentInput, memo);
  await this.click(primaryButton);
});

Then(/^The memo content says "([^"]*)"$/, async function (memo) {
  await this.waitForElement({ locator: '.memoContent', method: 'css' });
  const memoContent = await getMemoText(this);
  chai.expect(memoContent).to.equal(memo);
});

Then(/^I edit the memo to say "([^"]*)"$/, async function (memo) {
  await this.click({ locator: '.editMemoButton', method: 'css' });
  await this.click(primaryButton);
  await this.clearInputUpdatingForm(memoContentInput, MAX_MEMO_SIZE);
  await this.input(memoContentInput, memo);
  await this.click(primaryButton);
});

Then(/^I delete the memo$/, async function () {
  await this.click(editMemoButton);
  await this.click(primaryButton);
  await deleteMemo(this);
});

Then(/^There is no memo for the transaction$/, async function () {
  await this.waitForElement(addMemoButton);
});

Then(/^I add a transaction memo that says "([^"]*)"$/, async function (memo) {
  await this.driver.sleep(500);
  await this.click(addMemoButton);
  await this.driver.sleep(500);
  await this.click(primaryButton);
  await this.driver.sleep(500);
  await this.input(memoContentInput, memo);
});
