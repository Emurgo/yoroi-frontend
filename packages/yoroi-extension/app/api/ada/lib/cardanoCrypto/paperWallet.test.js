// @flow

import '../test-config.forTests';
import { schema } from 'lovefield';
import {
  generateWalletRootKey,
} from './cryptoWallet';
import {
  isValidEnglishAdaPaperMnemonic,
  unscramblePaperAdaMnemonic,
} from './paperWallet';
import { RustModule } from './rustLoader';
import {
  silenceLogsForTesting,
} from '../../../../utils/logging';
import {
  loadLovefieldDB,
} from '../storage/database/index';
import config from '../../../../config';
import { networks } from '../storage/database/prepackaged/networks';
import { bytesToHex } from '../../../../coreUtils';

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
  silenceLogsForTesting();
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

test('Unscramble Yoroi paper matches expected address', async () => {
  const [words] = unscramblePaperAdaMnemonic(
    VALID_YOROI_PAPER.scrambledWords,
    config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
    VALID_YOROI_PAPER.password
  );

  const baseConfig = networks.CardanoMainnet.BaseConfig[0];
  if (baseConfig.ByronNetworkId == null) {
    throw new Error(`missing Byron network id`);
  }
  expect(words).toBeTruthy();
  if (words != null) {
    const rootPk = generateWalletRootKey(words);
    expect(bytesToHex(rootPk.as_bytes())).toEqual(VALID_YOROI_PAPER.privateKey);
  }
});
