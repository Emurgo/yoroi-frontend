// @flow

import '../test-config';
import { schema } from 'lovefield';
import { validateMnemonic } from 'bip39';
import {
  getCryptoDaedalusWalletFromMnemonics,
  generateWalletRootKey,
} from './cryptoWallet';
import {
  isValidEnglishAdaPaperMnemonic,
  unscramblePaperAdaMnemonic,
  scramblePaperAdaMnemonic,
} from './paperWallet';
import {
  getAddressesKeys,
} from '../../transactions/transfer/legacyDaedalus';
import { RustModule } from './rustLoader';
import { generateByronPlate } from './plate';
import {
  silenceLogsForTesting,
} from '../../../../utils/logging';
import {
  loadLovefieldDB,
} from '../storage/database/index';
import config from '../../../../config';
import { networks } from '../storage/database/prepackaged/networks';

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
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
  silenceLogsForTesting();
});

test('Is valid Daedalus paper mnemonic', () => {
  // Note: expect these to print error to console

  expect(isValidEnglishAdaPaperMnemonic(
    VALID_DD_PAPER.words,
    config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT
  )).toEqual(true);
  // fails if length parameter is incorrect
  expect(isValidEnglishAdaPaperMnemonic(VALID_DD_PAPER.words, 30)).toEqual(false);

  // TODO: why did we need two tests for this?
  expect(isValidEnglishAdaPaperMnemonic(
    INVALID_DD_PAPER_1,
    config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT
  )).toEqual(false);
  expect(isValidEnglishAdaPaperMnemonic(
    INVALID_DD_PAPER_2,
    config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT
  )).toEqual(false);
});

test('Unscramble Daedalus paper produces 12 valid words', async () => {
  const [words, count] = unscramblePaperAdaMnemonic(
    VALID_DD_PAPER.words,
    config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT
  );
  expect(count).toEqual(config.wallets.DAEDALUS_RECOVERY_PHRASE_WORD_COUNT);
  if (words == null) throw new Error('failed to unscramble in test');
  expect(validateMnemonic(words)).toEqual(true);
});

test('Unscramble Daedalus paper matches expected address', async () => {
  const [words] = unscramblePaperAdaMnemonic(
    VALID_DD_PAPER.words,
    config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT
  );
  expect(words).toBeTruthy();
  if (words != null) {
    const daedalusWallet = getCryptoDaedalusWalletFromMnemonics(words);
    const checker = RustModule.WalletV2.DaedalusAddressChecker.new(daedalusWallet);
    const addressMap = getAddressesKeys({
      checker,
      fullUtxo: [VALID_DD_PAPER.address, UNEXPECTED_DD_ADDRESS]
    });
    expect(VALID_DD_PAPER.address in addressMap).toEqual(true);
    expect(UNEXPECTED_DD_ADDRESS in addressMap).toEqual(false);
    expect(addressMap[VALID_DD_PAPER.address].to_hex()).toEqual(VALID_DD_PAPER.privateKey);
  }
});

const VALID_YOROI_PAPER = {
  originalWords: 'business sight another write gadget near where hollow insane dynamic grain hurt slim clip require',
  password: 'testpasswordtest',
  scrambledWords: 'air comic label visual scale twist sell build ankle copy expect rocket crystal allow tissue eager jaguar crouch million cushion beach',
  byronAddress: 'Ae2tdPwUPEZ5WTs87mbEwJjbW7pmkigLfBnLp3eKfGehapUMKiewwMn5yxh',
  privateKey: '104e6fe092dff467502839395b9415672f35af08ae094a9b9bb7823caa5e835845b60600c66c654bf1a27b5d202a76b2169d0dfbf67b1cb9db89459892d319be16c6824f38cbc9377d14de83f8619fa5a7368ae74cffa939e42d91b877e2c1be',
};
const INVALID_YOROI_PAPER_1 =
  'air comic label visual scale twist sell build ankle copy expect rocket crystal allow tissue eager jaguar crouch million cushion cushion';

test('Is valid Yoroi paper mnemonic', () => {
  // Note: expect these to print error to console

  expect(isValidEnglishAdaPaperMnemonic(
    VALID_YOROI_PAPER.scrambledWords,
    config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT
  )).toEqual(true);
  // fails if length parameter is incorrect
  expect(isValidEnglishAdaPaperMnemonic(VALID_YOROI_PAPER.scrambledWords, 30)).toEqual(false);
  // fails if mnemonic itself is incorrect
  expect(isValidEnglishAdaPaperMnemonic(
    INVALID_YOROI_PAPER_1,
    config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT
  )).toEqual(false);
});

test('Scramble then unscramble Yoroi paper wallet is no-op', () => {
  const password = 'testpasswordtest';
  const scrambled = scramblePaperAdaMnemonic(
    VALID_YOROI_PAPER.originalWords,
    password,
  );
  const [words] = unscramblePaperAdaMnemonic(
    scrambled,
    config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
    password
  );
  expect(words).toEqual(VALID_YOROI_PAPER.originalWords);
});

test('Unscramble Yoroi paper matches expected address', async () => {
  const [words] = unscramblePaperAdaMnemonic(
    VALID_YOROI_PAPER.scrambledWords,
    config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
    VALID_YOROI_PAPER.password
  );

  const baseConfig = networks.ByronMainnet.BaseConfig[0];
  if (baseConfig.ByronNetworkId == null) {
    throw new Error(`missing Byron network id`);
  }
  const { ByronNetworkId } = baseConfig;
  expect(words).toBeTruthy();
  if (words != null) {
    const rootPk = generateWalletRootKey(words);
    expect(Buffer.from(rootPk.as_bytes()).toString('hex')).toEqual(VALID_YOROI_PAPER.privateKey);
    const plate = generateByronPlate(
      rootPk,
      0, // account index
      1, // address count
      ByronNetworkId
    );
    expect(plate.addresses[0]).toEqual(VALID_YOROI_PAPER.byronAddress);
  }
});
