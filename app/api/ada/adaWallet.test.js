/* eslint-disable camelcase */
// @flow
import './lib/test-config';
import {
  isValidPaperMnemonic,
  unscramblePaperMnemonic
} from './adaWallet';
import {
  RandomAddressChecker,
} from 'rust-cardano-crypto';
import bip39 from 'bip39';

const VALID_DD_PAPER = {
  words: 'fire shaft radar three ginger receive result phrase song staff scorpion food undo will have expire nice uncle dune until lift unlock exist step world slush disagree',
  address: 'DdzFFzCqrht2FYx935sAdqdEF61gS2L5ENNYqFHgMwfP8833zyfyBDtZC193Lx9CB1LCpYtSBUhnkaCn1Q55Xrah2wcKowiddT2VJrv6',
};
const INVALID_DD_PAPER_1 =
  'shaft fire radar three ginger receive result phrase song staff scorpion food undo will have expire nice uncle dune until lift unlock exist step world slush disagree';
const INVALID_DD_PAPER_2 =
  'shaft radar fire three ginger receive result phrase song staff scorpion food undo will have expire nice uncle dune until lift unlock exist step world disagree slush';
const UNEXPECTED_DD_ADDRESS =
  'DdzFFzCqrht2WKNEFqHvMSumSQpcnMxcYLNNBXPYXyHpRk9M7PqVjZ5ysYzutnruNubzXak2NxT8UWTFQNzc77uzjQ1GtehBRBdAv7xb';

test('Is valid Daedalus paper mnemonic', () => {
  expect(isValidPaperMnemonic(VALID_DD_PAPER.words, 27)).toEqual(true);
  expect(isValidPaperMnemonic(VALID_DD_PAPER.words, 30)).toEqual(false);
  expect(isValidPaperMnemonic(INVALID_DD_PAPER_1, 27)).toEqual(false);
  expect(isValidPaperMnemonic(INVALID_DD_PAPER_2, 27)).toEqual(false);
});

test('Unscramble Daedalus paper produces 12 valid words', () => {
  const [words, count] = unscramblePaperMnemonic(VALID_DD_PAPER.words, 27);
  expect(count).toEqual(12);
  expect(bip39.validateMnemonic(words)).toEqual(true);
});

test('Unscramble Daedalus paper matches expected address', () => {
  const [words] = unscramblePaperMnemonic(VALID_DD_PAPER.words, 27);
  expect(words).toBeTruthy();
  if (words) {
    const { result: checker } = RandomAddressChecker.newCheckerFromMnemonics(words);
    const { result } = RandomAddressChecker.checkAddresses(checker,
      [VALID_DD_PAPER.address, UNEXPECTED_DD_ADDRESS]);
    const resultMap = result.reduce((m, v) => { m[v.address] = v.addressing; return m; }, {});
    expect(VALID_DD_PAPER.address in resultMap).toEqual(true);
    expect(UNEXPECTED_DD_ADDRESS in resultMap).toEqual(false);
    expect(resultMap[VALID_DD_PAPER.address]).toEqual([0x80000000, 0x80000000]);
  }
});
