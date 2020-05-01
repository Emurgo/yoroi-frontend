// @flow

import { Then, } from 'cucumber';
import chai from 'chai';
import { MAX_MEMO_SIZE } from '../../app/config/externalStorageConfig';

Then(
  /^I add a memo that says "([^"]*)"$/,
  async function (memo) {
    await this.click('.addMemoButton');
    await this.click('.primary');
    await this.input("input[name='memoContent']", memo);
    await this.click('.primary');
  }
);

Then(
  /^The memo content says "([^"]*)"$/,
  async function (memo) {
    await this.waitForElement('.memoContent');
    const memoElem = await this.getElementsBy('.memoContent');
    const memoContent = await memoElem[0].getText();
    chai.expect(memoContent).to.equal(memo);
  }
);

Then(
  /^I edit the memo to say "([^"]*)"$/,
  async function (memo) {
    await this.click('.editMemoButton');
    await this.click('.primary');
    await this.clearInputUpdatingForm("input[name='memoContent']", MAX_MEMO_SIZE);
    await this.input("input[name='memoContent']", memo);
    await this.click('.primary');
  }
);


Then(
  /^I delete the memo$/,
  async function () {
    await this.click('.editMemoButton');
    await this.click('.primary');
    await this.click('.deleteContent');
    await this.click('.primary');
  }
);

Then(
  /^There is no memo for the transaction$/,
  async function () {
    await this.waitForElement('.addMemoButton');
  }
);

Then(
  /^I add a transaction memo that says "([^"]*)"$/,
  async function (memo) {
    await this.click('.addMemoButton');
    await this.click('.Dialog_actions .primary');
    await this.input("input[name='memo']", memo);
  }
);
