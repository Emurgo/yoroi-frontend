/* eslint-disable camelcase */
// @flow
import './lib/test-config';
import { schema } from 'lovefield';
import {
  isValidPaperMnemonic,
  unscramblePaperMnemonic
} from './adaWallet';
import { validateMnemonic } from 'bip39';
import {
  getCryptoDaedalusWalletFromMnemonics,
} from './lib/cardanoCrypto/cryptoWallet';
import {
  getAddressesKeys,
} from './daedalusTransfer';
import { RustModule } from './lib/cardanoCrypto/rustLoader';
import {
  silenceLogsForTesting,
} from '../../utils/logging';
import {
  loadLovefieldDB,
} from './lib/storage/lovefieldDatabase';

const VALID_DD_PAPER = {
  words: 'fire shaft radar three ginger receive result phrase song staff scorpion food undo will have expire nice uncle dune until lift unlock exist step world slush disagree',
  address: 'DdzFFzCqrht2FYx935sAdqdEF61gS2L5ENNYqFHgMwfP8833zyfyBDtZC193Lx9CB1LCpYtSBUhnkaCn1Q55Xrah2wcKowiddT2VJrv6',
  privateKey: '456603a7dabcdaf92bc04bb868f0cd5bb409e377c319505aace318e49cebe30c76e36d7005a04bfa99769c9f40d7c172ce3960cc96489d8b96faa8d758f594a77003f41b9be4f637289b1124a560690e43f418fda994cb4f6dee3b43965b6b95',
};
const INVALID_DD_PAPER_1 =
  'shaft fire radar three ginger receive result phrase song staff scorpion food undo will have expire nice uncle dune until lift unlock exist step world slush disagree';
const INVALID_DD_PAPER_2 =
  'shaft radar fire three ginger receive result phrase song staff scorpion food undo will have expire nice uncle dune until lift unlock exist step world disagree slush';
const UNEXPECTED_DD_ADDRESS =
  'DdzFFzCqrht2WKNEFqHvMSumSQpcnMxcYLNNBXPYXyHpRk9M7PqVjZ5ysYzutnruNubzXak2NxT8UWTFQNzc77uzjQ1GtehBRBdAv7xb';

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB({
    storeType: schema.DataStoreType.MEMORY,
  });
  silenceLogsForTesting();
});

test('Is valid Daedalus paper mnemonic', async () => {
  expect(isValidPaperMnemonic(VALID_DD_PAPER.words, 27)).toEqual(true);
  expect(isValidPaperMnemonic(VALID_DD_PAPER.words, 30)).toEqual(false);
  // Note: expect these to print error to console
  expect(isValidPaperMnemonic(INVALID_DD_PAPER_1, 27)).toEqual(false);
  expect(isValidPaperMnemonic(INVALID_DD_PAPER_2, 27)).toEqual(false);
});

test('Unscramble Daedalus paper produces 12 valid words', async () => {
  const [words, count] = unscramblePaperMnemonic(VALID_DD_PAPER.words, 27);
  expect(count).toEqual(12);
  expect(validateMnemonic(words)).toEqual(true);
});

test('Unscramble Daedalus paper matches expected address', async () => {
  const [words] = unscramblePaperMnemonic(VALID_DD_PAPER.words, 27);
  expect(words).toBeTruthy();
  if (words) {
    const daedalusWallet = getCryptoDaedalusWalletFromMnemonics(words);
    const checker = RustModule.Wallet.DaedalusAddressChecker.new(daedalusWallet);
    const addressMap = getAddressesKeys({
      checker,
      fullUtxo: [VALID_DD_PAPER.address, UNEXPECTED_DD_ADDRESS]
    });
    expect(VALID_DD_PAPER.address in addressMap).toEqual(true);
    expect(UNEXPECTED_DD_ADDRESS in addressMap).toEqual(false);
    expect(addressMap[VALID_DD_PAPER.address].to_hex()).toEqual(VALID_DD_PAPER.privateKey);
  }
});
