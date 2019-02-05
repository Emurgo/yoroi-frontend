/* eslint-disable camelcase */
// @flow
import './lib/test-config';
import {
  isValidPaperMnemonic,
  unscramblePaperMnemonic
} from './adaWallet';
import bip39 from 'bip39';

const VALID_DD_PAPER = {
  words: 'fire shaft radar three ginger receive result phrase song staff scorpion food undo will have expire nice uncle dune until lift unlock exist step world slush disagree',
  address: 'DdzFFzCqrht2FYx935sAdqdEF61gS2L5ENNYqFHgMwfP8833zyfyBDtZC193Lx9CB1LCpYtSBUhnkaCn1Q55Xrah2wcKowiddT2VJrv6',
};
const INVALID_DD_PAPER_1 =
  'shaft fire radar three ginger receive result phrase song staff scorpion food undo will have expire nice uncle dune until lift unlock exist step world slush disagree';
const INVALID_DD_PAPER_2 =
  'shaft radar fire three ginger receive result phrase song staff scorpion food undo will have expire nice uncle dune until lift unlock exist step world disagree slush';

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

test('Unscramble Daedalus paper produces matching address', () => {

});
